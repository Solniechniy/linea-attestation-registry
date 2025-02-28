import { ArrowDownUp } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { EQueryParams } from "@/enums/queryParams";
import { ETableSorting } from "@/enums/tableSorting";

export const SortByDate: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get(EQueryParams.SORT_BY_DATE);

  const handleSort = () => {
    const currentSearchParams = new URLSearchParams(searchParams);

    if (sort === null) {
      currentSearchParams.set(EQueryParams.SORT_BY_DATE, ETableSorting.ASC);
    } else if (sort === ETableSorting.ASC) {
      currentSearchParams.set(EQueryParams.SORT_BY_DATE, ETableSorting.DESC);
    } else {
      currentSearchParams.delete(EQueryParams.SORT_BY_DATE);
    }
    setSearchParams(currentSearchParams);
  };

  return (
    <div className="flex items-center justify-end gap-2 cursor-pointer" onClick={handleSort}>
      Issued
      <ArrowDownUp
        className={`w-4 h-4 slate-300 sort-arrows
          ${sort === ETableSorting.ASC && "asc"} ${sort === ETableSorting.DESC && "desc"}
        `}
      />
    </div>
  );
};
