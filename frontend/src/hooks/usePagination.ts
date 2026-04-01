import { useState } from 'react';

export const usePagination = (defaultLimit = 10) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [total, setTotal] = useState(0);

  const onChange = (newPage: number, newLimit?: number) => {
    setPage(newPage);
    if (newLimit) setLimit(newLimit);
  };

  return { page, limit, total, setTotal, onChange };
};
