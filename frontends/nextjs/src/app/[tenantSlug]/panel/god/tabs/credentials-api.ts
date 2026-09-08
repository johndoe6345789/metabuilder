/** The credentials tab's two calls. */

import { BASE_PATH } from '@/lib/app-config'
import type { TenantRecord, UserRecord } from './credentials-types'
import { unwrapList } from './credentials-data'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
const TIMEOUT_MS = 8000

/**
 * The accounts in scope.
 *
 * This asked /system/core/User with ?filter.tenantId=<scope>. DBAL scopes
 * by the URL's tenant and ignores filter.tenantId entirely (see
 * tenant-exists.ts), so every founder was handed the *system* tenant's
 * users over the wire -- and visibleAccounts then discarded all of them
 * for having the wrong tenantId. The founder's own members live at
 * /{tenant}/core/User and were never fetched: the tab was permanently
 * empty. "all" has no single request behind it; the instance owner's
 * picker walks tenants one at a time.
 */
function userUrl(scope: string): string {
  const tenant = scope === 'all' ? 'system' : scope
  return `${DBAL_URL}/${encodeURIComponent(tenant)}/core/User`
}

/** Accounts in scope, plus the tenant list a supergod needs to switch. */
export async function fetchAccounts(
  scope: string,
  isSupergod: boolean
): Promise<{ accounts: UserRecord[]; tenants: TenantRecord[] }> {
  const [userRes, tenantRes] = await Promise.all([
    fetch(userUrl(scope), {
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }),
    // There is no Tenant entity (see tenant-exists.ts); this 404s and the
    // catch below hands the picker its fallback. Kept for the day one
    // exists, and so the fallback stays exercised.
    isSupergod
      ? fetch(`${DBAL_URL}/system/core/Tenant`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(TIMEOUT_MS),
        }).catch(() => null)
      : Promise.resolve(null),
  ])

  if (!userRes.ok) {
    throw new Error(`User list failed with ${String(userRes.status)}`)
  }

  const tenantRaw =
    tenantRes?.ok === true ? ((await tenantRes.json()) as unknown) : null

  return {
    // An account with no username is not one a password can be set for.
    accounts: unwrapList<UserRecord>(await userRes.json()).filter(
      a => a.username != null && a.username.length > 0
    ),
    tenants: unwrapList<TenantRecord>(tenantRaw),
  }
}

/**
 * Sets a password.
 *
 * The plaintext goes to our own origin, which attaches the admin token
 * server-side and lets DBAL hash it with Argon2id. Hashing here would
 * produce a digest verify_password cannot check.
 */
export async function setCredential(
  username: string,
  password: string,
  tenantId: string
): Promise<void> {
  const res = await fetch(`${BASE_PATH}/api/admin/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password, tenantId }),
  })
  const payload = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new Error(payload.error ?? 'Credential write refused')
}
