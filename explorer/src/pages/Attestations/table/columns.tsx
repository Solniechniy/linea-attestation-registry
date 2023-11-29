import { ColumnDef } from '@tanstack/react-table';
import { Attestation } from '@verax-attestation-registry/verax-sdk/lib/types/.graphclient';
import { useSearchParams } from 'react-router-dom';

const SortByDate: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSort = () => {
    const currentSearchParams = new URLSearchParams(searchParams);

    if (searchParams.get('sort_by_date') === null) {
      currentSearchParams.set('sort_by_date', 'asc');
    } else if (searchParams.get('sort_by_date') === 'asc') {
      currentSearchParams.set('sort_by_date', 'desc');
    } else {
      currentSearchParams.delete('sort_by_date');
    }
    setSearchParams(currentSearchParams);
  };

  return <div onClick={handleSort}>Issued</div>;
};

// const SortByPortal: React.FC = () => {
//   const [searchParams, setSearchParams] = useSearchParams();

//   const handleSort = () => {
//     const currentSearchParams = new URLSearchParams(searchParams);
//     currentSearchParams.set('portal', 'portal');
//     currentSearchParams.set('sort', 'asc');
//     setSearchParams(currentSearchParams);
//   };

//   return <div onClick={handleSort}>Portal</div>;
// };

export const columns: ColumnDef<Attestation>[] = [
  {
    accessorKey: 'portal',
    header: 'Portal',
  },
  {
    accessorKey: 'id',
    header: 'Attestation ID',
  },
  {
    accessorKey: 'schemaString',
    header: 'Schema',
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
  },
  {
    accessorKey: 'attestedDate',
    header: () => {
      return <SortByDate />;
    },
  },
];
