export interface ListQueryParams {
  page?: number
  limit?: number
  filter?: Record<string, unknown>
  sort?: string
}

/** Build a query string from list params, or '' when there are none. */
export function buildQueryString(params: ListQueryParams): string {
  const searchParams = new URLSearchParams()

  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString())
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString())
  }
  if (params.filter !== undefined) {
    searchParams.append('filter', JSON.stringify(params.filter))
  }
  if (params.sort !== undefined) {
    searchParams.append('sort', params.sort)
  }

  const queryString = searchParams.toString()
  return queryString.length > 0 ? `?${queryString}` : ''
}
