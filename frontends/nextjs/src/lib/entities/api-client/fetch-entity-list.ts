import { readList } from '@/lib/db/read-list'
import { request, type ApiResponse } from './request'
import { buildQueryString, type ListQueryParams } from './query-string'

/** Fetch entity list from the API, tenant/package-scoped. */
export async function fetchEntityList(
  tenant: string,
  pkg: string,
  entity: string,
  params: ListQueryParams = {}
): Promise<ApiResponse<unknown[]>> {
  const url = `/api/v1/${tenant}/${pkg}/${entity}${buildQueryString(params)}`
  const result = await request<unknown>(
    { url, method: 'GET' },
    `fetch entity list for ${tenant}/${pkg}/${entity}`
  )

  if (result.error !== undefined) {
    return { error: result.error, status: result.status }
  }
  return { data: readList(result.data), status: result.status }
}
