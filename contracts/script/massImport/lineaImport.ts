import fs from "fs";
import { config } from "dotenv";
import path from "path";
import { Contract, isAddress, JsonRpcProvider, parseUnits } from "ethers";
import { ethers } from "hardhat";

config();

const processedBatchIds: number[] = [];

// *********************************************************************************
// ********************************* CONFIGURATION *********************************
// *********************************************************************************

const DEFAULT_MAX_FEE_PER_GAS = parseUnits("100", "gwei").toString();
const DEFAULT_GAS_ESTIMATION_PERCENTILE = "10";
const DEFAULT_GAS_PRICE_CAP = parseUnits("5", "gwei").toString();

type Config = {
  inputFile: string;
  portalAddress: string;
  maxFeePerGas: number;
  gasEstimationPercentile: number;
  gasPriceCap: number;
  attestationRegistry: Contract;
};

type Batch = {
  id: number;
  recipients: string[];
  amount: number;
};

enum BatchStatuses {
  Failed = "Failed",
  Success = "Success",
  Pending = "Pending",
}

type TrackingData = {
  recipients: string[];
  tokenAmount: number;
  status: BatchStatuses;
  transactionHash?: string;
  error?: unknown;
};

type Fees = {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas?: bigint;
};

type FeeHistory = {
  oldestBlock: number;
  reward: string[][];
  baseFeePerGas: string[];
  gasUsedRatio: number[];
};

function requireEnv(name: string): string {
  const envVariable = process.env[name];
  if (!envVariable) {
    throw new Error(`Missing ${name} environment variable.`);
  }
  return envVariable;
}

async function getConfig(): Promise<Config> {
  const inputFile = requireEnv("INPUT_FILE");
  const portalAddress = requireEnv("PORTAL_ADDRESS");
  const attestationRegistryAddress = requireEnv("ATTESTATION_REGISTRY_ADDRESS");

  if (!isAddress(portalAddress)) {
    throw new Error(`Portal address is not a valid Ethereum address.`);
  }

  if (!isAddress(attestationRegistryAddress)) {
    throw new Error(`Attestation Registry address is not a valid Ethereum address.`);
  }

  if (path.extname(inputFile) !== ".json") {
    throw new Error(`File ${inputFile} is not a JSON file.`);
  }

  if (!fs.existsSync(inputFile)) {
    throw new Error(`File ${inputFile} does not exist.`);
  }

  const attestationRegistry: Contract = await ethers.getContractAt("AttestationRegistry", attestationRegistryAddress);

  return {
    inputFile,
    portalAddress,
    maxFeePerGas: parseInt(process.env.MAX_FEE_PER_GAS ?? DEFAULT_MAX_FEE_PER_GAS),
    gasEstimationPercentile: parseInt(process.env.GAS_ESTIMATION_PERCENTILE ?? DEFAULT_GAS_ESTIMATION_PERCENTILE),
    gasPriceCap: parseFloat(process.env.GAS_PRICE_CAP ?? DEFAULT_GAS_PRICE_CAP),
    attestationRegistry,
  };
}

// *********************************************************************************
// ********************************* UTILS FUNCTIONS *******************************
// *********************************************************************************

export const wait = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

function createTrackingFile(path: string): Map<number, TrackingData> {
  if (fs.existsSync(path)) {
    const mapAsArray = fs.readFileSync(path, "utf-8");
    return new Map(JSON.parse(mapAsArray));
  }

  fs.writeFileSync(path, JSON.stringify(Array.from(new Map<number, TrackingData>().entries())));
  return new Map<number, TrackingData>();
}

function updateTrackingFile(trackingData: Map<number, TrackingData>) {
  fs.writeFileSync("tracking.json", JSON.stringify(Array.from(trackingData.entries()), null, 2));
}

async function processPendingBatches(
  provider: JsonRpcProvider,
  batches: Batch[],
  trackingData: Map<number, TrackingData>,
): Promise<(Batch & { transactionHash?: string })[]> {
  const pendingBatches = batches
    .filter((batch) => trackingData.get(batch.id)?.status === BatchStatuses.Pending)
    .map((batch) => ({
      ...batch,
      transactionHash: trackingData.get(batch.id)?.transactionHash,
    }));

  const remainingPendingBatches: (Batch & { transactionHash?: string })[] = [];

  for (const { transactionHash, id, recipients, amount } of pendingBatches) {
    if (!transactionHash) {
      remainingPendingBatches.push({ id, recipients, amount });
      continue;
    }

    const receipt = await provider.getTransactionReceipt(transactionHash);

    if (!receipt) {
      remainingPendingBatches.push({ id, recipients, amount, transactionHash });
      continue;
    }

    if (receipt.status == 0) {
      // track failing batches
      trackingData.set(id, {
        recipients,
        tokenAmount: amount,
        status: BatchStatuses.Failed,
        transactionHash,
      });

      console.log(`Transaction reverted. Hash: ${transactionHash}, batchId: ${id}`);
      updateTrackingFile(trackingData);

      // continue the batch loop
      continue;
    }
    // track succeded batches
    trackingData.set(id, {
      recipients,
      tokenAmount: amount,
      status: BatchStatuses.Success,
      transactionHash: transactionHash,
    });

    updateTrackingFile(trackingData);
    console.log(`Transaction succeed. Hash: ${transactionHash}, batchId: ${id}`);
  }

  return remainingPendingBatches;
}

async function get1559Fees(
  provider: JsonRpcProvider,
  maxFeePerGasFromConfig: bigint,
  percentile: number,
): Promise<Fees> {
  const { reward, baseFeePerGas }: FeeHistory = await provider.send("eth_feeHistory", ["0x4", "latest", [percentile]]);

  const maxPriorityFeePerGas =
    reward.reduce((acc: bigint, currentValue: string[]) => acc + BigInt(currentValue[0]), 0n) / BigInt(reward.length);

  if (maxPriorityFeePerGas && maxPriorityFeePerGas > maxFeePerGasFromConfig) {
    throw new Error(
      `Estimated miner tip of ${maxPriorityFeePerGas} exceeds configured max fee per gas of ${maxFeePerGasFromConfig}.`,
    );
  }

  const maxFeePerGas = BigInt(baseFeePerGas[baseFeePerGas.length - 1]) * 2n + maxPriorityFeePerGas;

  if (maxFeePerGas > 0n && maxPriorityFeePerGas > 0n) {
    return {
      maxPriorityFeePerGas,
      maxFeePerGas: maxFeePerGas > maxFeePerGasFromConfig ? maxFeePerGasFromConfig : maxFeePerGas,
    };
  }

  return {
    maxFeePerGas: maxFeePerGasFromConfig,
  };
}

// *********************************************************************************
// ********************************* MAIN FUNCTION *********************************
// *********************************************************************************

async function main() {
  const { inputFile, portalAddress, maxFeePerGas, gasEstimationPercentile, gasPriceCap, attestationRegistry } =
    await getConfig();

  const provider = ethers.provider;
  const { chainId } = await provider.getNetwork();
  const eip1559GasProvider = async () => get1559Fees(provider, BigInt(maxFeePerGas), gasEstimationPercentile);

  const trackingData = createTrackingFile("tracking.json");

  const readFile = fs.readFileSync(inputFile, "utf-8");
  const batches: Batch[] = JSON.parse(readFile);

  const filteredBatches = batches.filter(
    (batch) => trackingData.get(batch.id)?.status === BatchStatuses.Failed || !trackingData.has(batch.id),
  );

  console.log("Processing pending batches...");
  const remainingPendingBatches = await processPendingBatches(provider, batches, trackingData);

  if (remainingPendingBatches.length !== 0) {
    console.warn(`The following batches are still pending: ${JSON.stringify(remainingPendingBatches, null, 2)}`);
    return;
  }

  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  let nonce = await provider.getTransactionCount(signer.address);

  const pendingTransactions = [];

  console.log(`Total number of batches to process: ${filteredBatches.length}.`);

  for (const [index, batch] of filteredBatches.entries()) {
    try {
      let fees = await eip1559GasProvider();

      while (fees.maxFeePerGas > gasPriceCap) {
        console.warn(`Max fee per gas (${fees.maxFeePerGas.toString()}) exceeds gas price cap (${gasPriceCap})`);

        const currentBlockNumber = await provider.getBlockNumber();
        while ((await provider.getBlockNumber()) === currentBlockNumber) {
          console.warn(`Waiting for next block: ${currentBlockNumber}`);
          await wait(4_000);
        }

        fees = await eip1559GasProvider();
      }

      const transactionGasLimit = await attestationRegistry.massImport.estimateGas(batch, portalAddress);

      const txResponse = await attestationRegistry.massImport(batch, portalAddress, {
        value: 0,
        type: 2,
        gasLimit: transactionGasLimit,
        chainId,
        maxFeePerGas: fees.maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        nonce,
      });

      pendingTransactions.push(txResponse);

      trackingData.set(batch.id, {
        recipients: batch.recipients,
        tokenAmount: batch.amount,
        status: BatchStatuses.Pending,
        transactionHash: txResponse.hash,
      });

      updateTrackingFile(trackingData);

      processedBatchIds.push(batch.id);

      console.log(`Batch with ID=${batch.id} sent.\n ${JSON.stringify(batch)}\n`);
      nonce = nonce + 1;
    } catch (error) {
      trackingData.set(batch.id, {
        recipients: batch.recipients,
        tokenAmount: batch.amount,
        status: BatchStatuses.Failed,
        error,
      });
      updateTrackingFile(trackingData);
      console.error(`Batch with ID=${batch.id} failed.\n Stopping script execution.`);
      return;
    }

    if (index + (1 % 15) === 0) {
      console.log(`Pause the execution for 60 seconds...`);
      await wait(60_000);
    }
  }

  if (pendingTransactions.length !== 0) {
    console.log(`Waiting for all receipts...`);
  }

  const transactionsInfos = await Promise.all(
    pendingTransactions.map(async ({ transactionResponse, batch }) => {
      return {
        transactionReceipt: await transactionResponse.wait(),
        batch,
      };
    }),
  );

  for (const { batch, transactionReceipt } of transactionsInfos) {
    if (transactionReceipt) {
      if (transactionReceipt.status == 0) {
        trackingData.set(batch.id, {
          recipients: batch.recipients,
          tokenAmount: batch.amount,
          status: BatchStatuses.Failed,
          transactionHash: transactionReceipt.hash,
        });

        console.log(`Transaction reverted. Hash: ${transactionReceipt.hash}, batchId: ${batch.id}`);
        updateTrackingFile(trackingData);
        continue;
      }

      trackingData.set(batch.id, {
        recipients: batch.recipients,
        tokenAmount: batch.amount,
        status: BatchStatuses.Success,
        transactionHash: transactionReceipt.hash,
      });

      updateTrackingFile(trackingData);
      console.log(`Transaction succeed. Hash: ${transactionReceipt.hash}, batchId: ${batch.id}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

process.on("SIGINT", () => {
  console.log(`Processed batches: ${JSON.stringify(processedBatchIds, null, 2)}`);
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  process.exit(1);
});
