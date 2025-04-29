/**
 * Define interface for pagination API responses.
 */
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Define interface for API responses when retrieving a list of items.
 * Includes both the data array and optional pagination information.
 *
 * @template T - The type of items in the data array.
 */
export interface PaginationResponse<T = any> {
  pagination?: Pagination;
  items: T[];
}
