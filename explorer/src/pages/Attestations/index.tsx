import { useNetworkContext } from '@/providers/network-provider';
import { OrderDirection } from '@verax-attestation-registry/verax-sdk/lib/types/.graphclient';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { DataTable } from './table/dataTable';
import { columns } from './table/columns';
import { CURRENT_PAGE_DEFAULT, ITEMS_PER_PAGE_DEFAULT, ZERO } from '@/constants';
import { useSearchParams } from 'react-router-dom';
// import { Pagination } from '@/components/Pagination';
import { EQueryParams } from '@/enums/queryParams';
import { ListSwitcher } from './components/ListSwitcher';
import { Pagination } from '@/components/Pagination';

export const Attestations: React.FC = () => {
  const { sdk } = useNetworkContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [skip, setSkip] = useState<number>(ZERO);

  const sortByDateDirection = searchParams.get(EQueryParams.SORT_BY_DATE);
  const attester = searchParams.get(EQueryParams.ATTESTER);
  const currentPage = Number(searchParams.get(EQueryParams.PAGE));

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

  const { data: attestationsCount } = useSWR(
    'attestationsCount',
    () => sdk.attestation.getAttestationIdCounter() as Promise<number>
  );

  useEffect(() => {
    const skipLocal = currentPage === CURRENT_PAGE_DEFAULT ? ZERO : (currentPage - 1) * ITEMS_PER_PAGE_DEFAULT;
    setSkip(skipLocal);
  }, [currentPage]);

  useEffect(() => {
    const searchParams = new URLSearchParams();

    () => {
      setSearchParams(searchParams);
    };
  }, []);

  return (
    <div className="container mt-5 md:mt-8">
      <h1 className="mb-6 md:mb-8 text-2xl md:text-[2rem]/[2rem] font-semibold tracking-tighter">
        Explore Attestations
      </h1>
      <div>
        <ListSwitcher />
        {attestationsList && <DataTable columns={columns} data={attestationsList} />}
        {attestationsCount && <Pagination itemsCount={attestationsCount} />}
      </div>
    </div>
  );
};
