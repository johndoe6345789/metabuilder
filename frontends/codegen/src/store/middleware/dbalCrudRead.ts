/**
 * DBAL read operations — fetch single and list entities.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isConnectionError, entityUrl } from './dbalConfig'

export async function fetchFromDBAL(
  sliceName: string,
  id: string,
): Promise<any | null> {
  try {
    const url = entityUrl(sliceName, id)
    const response = await fetch(url)
    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error(
        `DBAL fetch failed: ${response.status}` +
        ` ${response.statusText}`,
      )
    }
    return await response.json()
  } catch (error) {
    if (!isConnectionError(error)) {
      console.error(
        '[DBALSync] Error fetching from DBAL:', error,
      )
    }
    return null
  }
}

export async function listFromDBAL(
  sliceName: string,
  params?: Record<string, string>,
): Promise<any[]> {
  try {
    const url = new URL(entityUrl(sliceName))
    if (params) {
      Object.entries(params).forEach(([k, v]) =>
        url.searchParams.set(k, v),
      )
    }
    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(
        `DBAL list failed: ${response.status}` +
        ` ${response.statusText}`,
      )
    }
    const result = await response.json()
    return Array.isArray(result) ? result : result.data ?? []
  } catch (error) {
    if (!isConnectionError(error)) {
      console.error(
        '[DBALSync] Error listing from DBAL:', error,
      )
    }
    return []
  }
}
