import { ColumnDef } from '@tanstack/react-table';
import { Attestation } from '@verax-attestation-registry/verax-sdk/lib/types/.graphclient';
import { SortByDate } from './components/SortByDate';
import { hexToNumber } from 'viem/utils';
import { cropString } from '@/utils/stringUtils';
import { displayAmountWithComma } from '@/utils/amountUtils';
import { HelperIndicator } from '@/components/HelperIndicator';
import { Link } from 'react-router-dom';
import { toAttestationById } from '@/routes/constants';
import { Address } from 'viem';

export const columns: ColumnDef<Attestation>[] = [
  {
    accessorKey: 'id',
    header: () => (
      <div className="flex items-center gap-2.5">
        <HelperIndicator type="attestation" />
        Attestation ID
      </div>
    ),
    cell: ({ row }) => {
      const id = row.getValue('id');
      return (
        <Link to={toAttestationById(id as string)} className="text-[#3D3D51] hover:underline hover:text-[#3D3D51]">
          {displayAmountWithComma(hexToNumber(id as Address))}
        </Link>
      );
    },
  },
  {
    accessorKey: 'portal',
    header: () => (
      <div className="flex items-center gap-2.5">
        <HelperIndicator type="portal" />
        Portal
      </div>
    ),
    cell: ({ row }) => cropString(row.getValue('portal')),
  },
  {
    accessorKey: 'schemaString',
    header: () => (
      <div className="flex items-center gap-2.5">
        <HelperIndicator type="schema" />
        Schema
      </div>
    ),
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
    cell: ({ row }) => cropString(row.getValue('subject')),
  },
  {
    accessorKey: 'attestedDate',
    header: () => {
      return <SortByDate />;
    },
  },
];
