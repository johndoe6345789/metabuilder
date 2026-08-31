import { request, type ApiResponse } from './request'

/** Create a new entity via the API. */
export async function createEntity(
  tenant: string,
  pkg: string,
  entity: string,
  data: Record<string, unknown>
): Promise<ApiResponse> {
  return request(
    { url: `/api/v1/${tenant}/${pkg}/${entity}`, method: 'POST', body: data },
    `create entity ${tenant}/${pkg}/${entity}`
  )
}
