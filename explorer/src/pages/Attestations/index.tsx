import { useNetworkContext } from '@/providers/network-provider';
import { OrderDirection } from '@verax-attestation-registry/verax-sdk/lib/types/.graphclient';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { DataTable } from './table/dataTable';
import { columns } from './table/columns';
import { CURRENT_PAGE_DEFAULT, ITEMS_PER_PAGE_DEFAULT, ZERO } from '@/constants';
import { useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';

export const Attestations: React.FC = () => {
  const { address } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortByDateDirection = searchParams.get('sort_by_date');
  const attester = searchParams.get('attester');

  const [currentPage, setCurrentPage] = useState<number>(CURRENT_PAGE_DEFAULT);
  const [skip, setSkip] = useState<number>(ZERO);
  const { sdk } = useNetworkContext();

  const handleAttester = (address?: string) => {
    const currentSearchParams = new URLSearchParams(searchParams);
    address ? currentSearchParams.set('attester', address) : currentSearchParams.delete('attester');

    setSearchParams(currentSearchParams);
  };

  const { data: attestationsList } = useSWR(
    sortByDateDirection
      ? `findBy/${ITEMS_PER_PAGE_DEFAULT}/${skip}/attester=${attester}/attestedDate/${sortByDateDirection}`
      : `findBy/${ITEMS_PER_PAGE_DEFAULT}/${skip}/attester=${attester}`,
    () =>
      sdk.attestation.findBy(
        ITEMS_PER_PAGE_DEFAULT,
        skip,
        attester ? { attester } : undefined,
        'attestedDate',
        sortByDateDirection as OrderDirection
      )
  );

  useEffect(() => {
    console.log('skip', skip);
    console.log('data', attestationsList);
  }, [skip, attestationsList]);

  useEffect(() => {
    console.log('currentPage', currentPage);
    const skipLocal = currentPage === CURRENT_PAGE_DEFAULT ? ZERO : (currentPage - 1) * ITEMS_PER_PAGE_DEFAULT;
    console.log('skipLocal', skipLocal);
    setSkip(skipLocal);
  }, [currentPage]);

  return (
    <>
      <p>Explore Attestations</p>
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        prev
      </button>
      <span>{currentPage}</span>
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        next
      </button>
      <div>
        <button
          onClick={() => handleAttester()}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          All attestations
        </button>
        <button
          disabled={!address}
          onClick={() => handleAttester(address)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          My attestations
        </button>
      </div>
      <div>
        <div>Table</div>
        {attestationsList && <DataTable columns={columns} data={attestationsList} />}
      </div>
    </>
  );
};
