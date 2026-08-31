import { request, type ApiResponse } from './request'

/** Delete an entity via the API. */
export async function deleteEntity(
  tenant: string,
  pkg: string,
  entity: string,
  id: string
): Promise<ApiResponse> {
  return request(
    {
      url: `/api/v1/${tenant}/${pkg}/${entity}/${id}`,
      method: 'DELETE',
      parseBody: false,
    },
    `delete entity ${tenant}/${pkg}/${entity}/${id}`
  )
}
