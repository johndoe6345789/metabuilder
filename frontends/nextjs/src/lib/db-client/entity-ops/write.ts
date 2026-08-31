import { dbalFetch, unwrap } from '../dbal-fetch'

/** create() and update() only differ in method and URL, and both let a
 *  failure surface rather than swallowing it -- unlike list/read, a
 *  failed write must not look like success. */
async function write(
  url: string,
  method: 'POST' | 'PUT',
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const raw = await dbalFetch<unknown>(url, {
    method,
    body: JSON.stringify(data),
  })
  return unwrap<Record<string, unknown>>(raw)
}

export function createEntity(
  base: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return write(base, 'POST', data)
}

export function updateEntity(
  base: string,
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return write(`${base}/${id}`, 'PUT', data)
}
