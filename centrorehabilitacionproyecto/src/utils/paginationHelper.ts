export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const createPaginationItems = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void,
  maxVisible: number = 5
) => {
  const items = [];
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    items.push(i);
  }

  return {
    items,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    firstPage: 1,
    lastPage: totalPages,
    currentPage
  };
};

