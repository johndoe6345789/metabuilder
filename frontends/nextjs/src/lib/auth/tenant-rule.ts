import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

/**
 * Whether this account may act on that community.
 *
 * Split from owns-tenant.ts, which reads the cookie jar and is therefore
 * server-only; this half is just the comparison, so anything that already
 * has the user can ask.
 *
 * The rule is the one the God Panel states for its own tenant picker:
 * your own community, unless you are the instance owner, because every
 * other 'god' is a single community's founder rather than an
 * instance-wide admin.
 */
export function ownsTenant(
  user: { role?: unknown; tenantId?: unknown },
  target: string
): boolean {
  if (user.role === 'supergod') return true
  const own =
    typeof user.tenantId === 'string' ? normalizeTenantId(user.tenantId) : ''
  // A session naming no tenant cannot be shown to own this one.
  return own !== '' && own === normalizeTenantId(target)
}
