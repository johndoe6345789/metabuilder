import { readRow } from '@/lib/db/read-list'
import { request, type ApiResponse } from './request'

/**
 * One entity by id.
 *
 * Unwrapped like the list beside it: the answer is an envelope, and
 * handing it back whole put the envelope itself on screen -- the edit
 * form showed a single field called "data" holding
 * `{"data":[{"id":"u1"}]}`, and the detail page showed the same. Seen in
 * a browser at /{tenant}/core/User/u1/edit.
 */
export async function fetchEntity(
  tenant: string,
  pkg: string,
  entity: string,
  id: string
): Promise<ApiResponse> {
  const result = await request<unknown>(
    { url: `/api/v1/${tenant}/${pkg}/${entity}/${id}`, method: 'GET' },
    `fetch entity ${tenant}/${pkg}/${entity}/${id}`
  )
  if (result.error !== undefined) return result
  return { data: readRow(result.data) ?? {}, status: result.status }
}
