export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: { code: string; message: string }
}

export interface Pagination {
  page: number
  per_page: number
  total_rows: number
  total_pages: number
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: Pagination
}
