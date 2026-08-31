import { dbalFetch } from '../dbal-fetch'

export async function removeEntity(base: string, id: string): Promise<boolean> {
  try {
    await dbalFetch<void>(`${base}/${id}`, { method: 'DELETE' })
    return true
  } catch {
    return false
  }
}
