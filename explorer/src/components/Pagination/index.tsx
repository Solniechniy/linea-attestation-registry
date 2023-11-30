import { ITEMS_PER_PAGE_DEFAULT } from '@/constants';
import { EQueryParams } from '@/enums/queryParams';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface IPaginationProps {
  itemsCount: number;
}

export const Pagination = ({ itemsCount }: IPaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get(EQueryParams.PAGE);
  const [currentPage, setCurrentPage] = useState<number>(Number(page) || 1);
  const totalPages = Math.ceil(itemsCount / ITEMS_PER_PAGE_DEFAULT);

  useEffect(() => {
    const currentSearchParams = new URLSearchParams(searchParams);
    currentSearchParams.set(EQueryParams.PAGE, currentPage.toString());
    setSearchParams(currentSearchParams);

    () => {
      currentSearchParams.delete(EQueryParams.PAGE);
      setSearchParams(currentSearchParams);
    };
  }, [currentPage, searchParams, setSearchParams]);

  /////////////////////////////////////

  const inputRef = useRef<HTMLInputElement>(null);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && inputRef && inputRef.current) {
      setCurrentPage(newPage);
      inputRef.current.value = newPage.toString();
    }
  };

  const handleFirstPage = () => handlePageChange(1);
  const handleLastPage = () => handlePageChange(totalPages);
  const handlePreviousPage = () => handlePageChange(currentPage - 1);
  const handleNextPage = () => handlePageChange(currentPage + 1);

  const changePage = (inputPage: string) => {
    const page = Number(inputPage);
    const selectedPage = Math.min(Math.max(page, 1), totalPages);
    inputPage.length && handlePageChange(selectedPage);
  };

  const blurHandler = () => {
    !inputRef.current?.value.length && handlePageChange(currentPage);
  };

  return (
    <>
      <button type="button" aria-label="First" onClick={handleFirstPage} disabled={currentPage === 1} className="prev">
        First Page
      </button>
      <button
        type="button"
        aria-label="Previous"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className="prev"
      >
        Previous page
      </button>
      <input
        type="number"
        ref={inputRef}
        key={currentPage}
        defaultValue={currentPage}
        onBlur={blurHandler}
        onChange={(event) => changePage(event.target.value)}
      />
      <button type="button" aria-label="Next" onClick={handleNextPage} disabled={currentPage === totalPages}>
        Next Page
      </button>
      <button type="button" aria-label="Last" onClick={handleLastPage} disabled={currentPage === totalPages}>
        Last Page
      </button>
      <span>{`of ${totalPages}`}</span>
      {/* <button
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
      </button> */}
    </>
  );
};
