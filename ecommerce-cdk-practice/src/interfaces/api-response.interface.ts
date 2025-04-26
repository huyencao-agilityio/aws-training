export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface APIGatewayResponse<T = any> {
  pagination?: Pagination;
  data: T[];
}
