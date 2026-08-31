import { dbalFetch, unwrap } from '../dbal-fetch'

export async function readEntity(
  base: string,
  id: string
): Promise<Record<string, unknown> | null> {
  try {
    const raw = await dbalFetch<unknown>(`${base}/${id}`)
    return unwrap<Record<string, unknown>>(raw)
  } catch {
    return null
  }
}
