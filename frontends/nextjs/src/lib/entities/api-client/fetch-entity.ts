import { request, type ApiResponse } from './request'

/** Fetch a single entity by ID from the API. */
export async function fetchEntity(
  tenant: string,
  pkg: string,
  entity: string,
  id: string
): Promise<ApiResponse> {
  return request(
    { url: `/api/v1/${tenant}/${pkg}/${entity}/${id}`, method: 'GET' },
    `fetch entity ${tenant}/${pkg}/${entity}/${id}`
  )
}
