import { EQueryParams } from '@/enums/queryParams';
import { ETableSorting } from '@/enums/tableSorting';
import { useSearchParams } from 'react-router-dom';

export const SortByDate: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSort = () => {
    const currentSearchParams = new URLSearchParams(searchParams);

    if (searchParams.get(EQueryParams.SORT_BY_DATE) === null) {
      currentSearchParams.set(EQueryParams.SORT_BY_DATE, ETableSorting.ASC);
    } else if (searchParams.get(EQueryParams.SORT_BY_DATE) === ETableSorting.ASC) {
      currentSearchParams.set(EQueryParams.SORT_BY_DATE, ETableSorting.DESC);
    } else {
      currentSearchParams.delete('sort_by_date');
    }
    setSearchParams(currentSearchParams);
  };

  return <div onClick={handleSort}>Issued</div>;
};
