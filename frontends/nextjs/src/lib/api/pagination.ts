/**
 * Pagination utilities for API requests and UI components
 * 
 * Provides utilities for both offset-based and cursor-based pagination
 */

export interface PaginationMetadata {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CursorPaginationMetadata {
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface CursorPaginationParams {
  limit?: number
  after?: string
  before?: string
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Normalize pagination parameters
 */
export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  const page = Math.max(1, params.page ?? DEFAULT_PAGE)
  const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit ?? DEFAULT_LIMIT))
  
  return { page, limit }
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMetadata(
  params: Required<PaginationParams>,
  total: number
): PaginationMetadata {
  const { page, limit } = params
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Calculate offset for database query
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Create pagination response
 */
export function createPaginationResponse<T>(
  data: T[],
  params: PaginationParams,
  total: number
): { data: T[]; meta: PaginationMetadata } {
  const normalizedParams = normalizePaginationParams(params)
  const meta = calculatePaginationMetadata(normalizedParams, total)
  
  return { data, meta }
}

/**
 * Normalize cursor pagination parameters
 */
export function normalizeCursorPaginationParams(
  params: CursorPaginationParams
): Required<Omit<CursorPaginationParams, 'after' | 'before'>> & Pick<CursorPaginationParams, 'after' | 'before'> {
  const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit ?? DEFAULT_LIMIT))
  
  return {
    limit,
    after: params.after,
    before: params.before,
  }
}

/**
 * Calculate cursor pagination metadata
 */
export function calculateCursorPaginationMetadata<T extends { id: string }>(
  items: T[],
  limit: number,
  hasMore: boolean
): CursorPaginationMetadata {
  const firstItem = items.length > 0 ? items[0] : undefined
  const lastItem = items.length > 0 ? items[items.length - 1] : undefined
  const startCursor = firstItem?.id
  const endCursor = lastItem?.id
  
  return {
    limit,
    hasNextPage: hasMore,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    hasPreviousPage: (startCursor !== null && startCursor !== undefined),
    startCursor,
    endCursor,
  }
}

/**
 * Create cursor pagination response
 */
export function createCursorPaginationResponse<T extends { id: string }>(
  data: T[],
  limit: number,
  hasMore: boolean
): { data: T[]; meta: CursorPaginationMetadata } {
  const meta = calculateCursorPaginationMetadata(data, limit, hasMore)
  
  return { data, meta }
}

/**
 * Encode cursor (base64 encode the ID)
 */
export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64')
}

/**
 * Decode cursor (base64 decode to get ID)
 */
export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8')
}

/**
 * Get page numbers for pagination UI
 */
export function getPageNumbers(currentPage: number, totalPages: number, maxVisible: number = 7): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const halfVisible = Math.floor(maxVisible / 2)
  let startPage = Math.max(1, currentPage - halfVisible)
  let endPage = Math.min(totalPages, currentPage + halfVisible)
  
  // Adjust if we're near the start or end
  if (currentPage <= halfVisible) {
    endPage = maxVisible
  } else if (currentPage >= totalPages - halfVisible) {
    startPage = totalPages - maxVisible + 1
  }
  
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
}
