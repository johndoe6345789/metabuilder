/**
 * DBAL write operations — sync, create, delete entities.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthToken } from '@metabuilder/dbal-sso/core'
import {
  DBAL_TENANT,
  isConnectionError,
  entityUrl,
} from './dbalConfig'

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function syncToDBAL(
  sliceName: string,
  id: string,
  data: any,
): Promise<void> {
  try {
    const url = entityUrl(sliceName, id)
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        ...data, id, tenantId: DBAL_TENANT,
      }),
    })
    if (!response.ok) {
      throw new Error(
        `DBAL sync failed: ${response.status}` +
        ` ${response.statusText}`,
      )
    }
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn(
        '[DBALSync] DBAL not reachable — sync skipped',
      )
    } else {
      console.error(
        '[DBALSync] Error syncing to DBAL:', error,
      )
    }
    throw error
  }
}

export async function createInDBAL(
  sliceName: string,
  data: any,
): Promise<any> {
  try {
    const url = entityUrl(sliceName)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        ...data, tenantId: DBAL_TENANT,
      }),
    })
    if (!response.ok) {
      throw new Error(
        `DBAL create failed: ${response.status}` +
        ` ${response.statusText}`,
      )
    }
    return await response.json()
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn(
        '[DBALSync] DBAL not reachable — create skipped',
      )
    } else {
      console.error(
        '[DBALSync] Error creating in DBAL:', error,
      )
    }
    throw error
  }
}

export async function deleteFromDBAL(
  sliceName: string,
  id: string,
): Promise<void> {
  try {
    const url = entityUrl(sliceName, id)
    const response = await fetch(url, { method: 'DELETE', headers: authHeaders() })
    if (!response.ok && response.status !== 404) {
      throw new Error(
        `DBAL delete failed: ${response.status}` +
        ` ${response.statusText}`,
      )
    }
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn(
        '[DBALSync] DBAL not reachable — delete skipped',
      )
    } else {
      console.error(
        '[DBALSync] Error deleting from DBAL:', error,
      )
    }
    throw error
  }
}
