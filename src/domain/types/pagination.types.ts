/**
 * Metadata cho pagination
 * Sử dụng cho tất cả các API có phân trang
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Generic type cho kết quả phân trang
 * @template T - Kiểu dữ liệu của items trong danh sách
 */
export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

/**
 * Helper function để tính toán pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
