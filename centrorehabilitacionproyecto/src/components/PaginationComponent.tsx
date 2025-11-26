import { Pagination } from 'react-bootstrap';

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationComponentProps {
  pagination: PaginationInfo | null;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  currentPage: number;
}

export default function PaginationComponent({ 
  pagination, 
  onPageChange, 
  itemsPerPage, 
  currentPage 
}: PaginationComponentProps) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const pages = [];
  const maxPages = 5;
  let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
  let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <Pagination.Item
        key={i}
        active={i === pagination.page}
        onClick={() => onPageChange(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  return (
    <>
      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(1)}
        />
        <Pagination.Prev
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(pagination.page - 1)}
        />
        {pages}
        <Pagination.Next
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        />
        <Pagination.Last
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.totalPages)}
        />
      </Pagination>
      <div className="text-center mt-3 text-muted">
        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} registros
      </div>
    </>
  );
}

