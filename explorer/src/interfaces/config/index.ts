import { Chain } from 'wagmi';
import VeraxSdk from '@verax-attestation-registry/verax-sdk';

export interface INetwork {
  name: string;
  chain: Chain;
  veraxEnv: typeof VeraxSdk.DEFAULT_LINEA_MAINNET_FRONTEND;
  img: string;
  network: string;
}
