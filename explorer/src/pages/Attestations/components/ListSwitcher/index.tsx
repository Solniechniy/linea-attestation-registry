import { EQueryParams } from '@/enums/queryParams';
import { useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';

export const ListSwitcher = () => {
  const { address } = useAccount();

  const [searchParams, setSearchParams] = useSearchParams();

  const attester = searchParams.get(EQueryParams.ATTESTER);

  const handleAttester = (address?: string) => {
    const currentSearchParams = new URLSearchParams(searchParams);
    address
      ? currentSearchParams.set(EQueryParams.ATTESTER, address)
      : currentSearchParams.delete(EQueryParams.ATTESTER);

    setSearchParams(currentSearchParams);
  };

  return (
    <div className="inline-flex bg-[#F4F5F9] gap-2 mb-6 rounded">
      <button
        disabled={Boolean(!attester)}
        onClick={() => handleAttester()}
        className={`h-[2.1875rem] px-3 rounded text-base font-medium ${
          attester ? 'text-[#656B87]' : 'text-[#FEFEFE] bg-[#3D3D51]'
        }`}
      >
        All attestations
      </button>
      <button
        disabled={!address || Boolean(attester)}
        onClick={() => handleAttester(address)}
        className={`h-[2.1875rem] px-3 rounded text-base font-medium ${
          attester ? 'text-[#FEFEFE] bg-[#3D3D51]' : 'text-[#656B87]'
        }`}
      >
        My attestations
      </button>
    </div>
  );
};
