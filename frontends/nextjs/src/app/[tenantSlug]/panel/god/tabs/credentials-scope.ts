/**
 * Who may see, and who may change, which account.
 *
 * The tab's isolation rules, kept apart from the view so they can be
 * stated as answers rather than as conditions inside JSX.
 */

import { getRoleLevel } from '@/lib/constants'
import { normalizeTenant } from './credentials-data'
import type { TenantRecord, UserRecord } from './credentials-types'

/** The level at which a user sees past their own tenant. */
export const SUPERGOD_LEVEL = 5

/** Every tenant the viewer may pick, always including their own. */
export function availableTenants(
  ownTenant: string,
  tenants: TenantRecord[]
): string[] {
  const ids = new Set<string>([ownTenant, 'system'])
  for (const tenant of tenants) {
    if (tenant.id.length > 0) ids.add(tenant.id)
    if (tenant.slug != null && tenant.slug.length > 0) ids.add(tenant.slug)
  }
  return [...ids].sort((a, b) => a.localeCompare(b))
}

/**
 * The scope actually applied. A god's choice is ignored: only a supergod
 * may look outside their own tenant, so the selector's value can never
 * widen what a god sees.
 */
export function effectiveScope(
  isSupergod: boolean,
  chosenScope: string,
  ownTenant: string
): string {
  return isSupergod ? chosenScope : ownTenant
}

/** The accounts this scope shows. */
export function visibleAccounts(
  accounts: UserRecord[],
  scope: string
): UserRecord[] {
  if (scope === 'all') return accounts
  return accounts.filter(a => normalizeTenant(a.tenantId) === scope)
}

/**
 * Whether the viewer may set this account's password.
 *
 * Two rules: a god is confined to their own tenant, and nobody below
 * supergod may reset an account that outranks them -- otherwise a god
 * could take a supergod's account by giving it a new password.
 */
export function canManageAccount(
  account: UserRecord,
  viewer: { isSupergod: boolean; level: number; tenant: string }
): boolean {
  const accountTenant = normalizeTenant(account.tenantId)
  if (!viewer.isSupergod && accountTenant !== viewer.tenant) return false
  const targetLevel = getRoleLevel(account.role ?? 'user')
  if (!viewer.isSupergod && targetLevel > viewer.level) return false
  return true
}

/** True when the account outranks a non-supergod viewer. */
export function outranksViewer(
  account: UserRecord,
  viewer: { isSupergod: boolean; level: number }
): boolean {
  if (viewer.isSupergod) return false
  return getRoleLevel(account.role ?? 'user') > viewer.level
}
