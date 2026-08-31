import { request, type ApiResponse } from './request'

/** Update an entity via the API. */
export async function updateEntity(
  tenant: string,
  pkg: string,
  entity: string,
  id: string,
  data: Record<string, unknown>
): Promise<ApiResponse> {
  return request(
    {
      url: `/api/v1/${tenant}/${pkg}/${entity}/${id}`,
      method: 'PUT',
      body: data,
    },
    `update entity ${tenant}/${pkg}/${entity}/${id}`
  )
}
