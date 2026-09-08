/**
 * The communities on this instance, worked out from who has an account.
 *
 * There is no Tenant entity -- `lib/tenant/tenant-exists.ts` says so, and
 * the same wrong assumption is what made `validateTenantAccess` refuse
 * everyone. This tab asked `/system/core/tenant` for one, got a 404, and
 * showed an empty list for its whole life. A community exists if it has
 * anyone in it, which is exactly the rule the rest of the app applies.
 */

export interface UserRow {
  id?: string
  username?: string
  role?: string
  tenantId?: string
  createdAt?: unknown
}

export interface Community {
  id: string
  name: string
  /** The founder: the god of that community, where there is one. */
  ownerId: string
  ownerName: string
  members: number
  /** The earliest account in it -- when the community started. */
  createdAt: number
}

const asMs = (raw: unknown): number => {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  return n < 1e12 ? Math.round(n * 1000) : Math.round(n)
}

/** One entry per community, oldest first, with its founder and size. */
export function communitiesFromUsers(users: UserRow[]): Community[] {
  const byTenant = new Map<string, UserRow[]>()
  for (const user of users) {
    const tenant = user.tenantId ?? ''
    if (tenant === '') continue
    byTenant.set(tenant, [...(byTenant.get(tenant) ?? []), user])
  }

  return [...byTenant.entries()]
    .map(([id, members]) => {
      const founder =
        members.find(u => u.role === 'god') ??
        members.find(u => u.role === 'supergod')
      const stamps = members.map(u => asMs(u.createdAt)).filter(n => n > 0)
      return {
        id,
        name: id,
        ownerId: founder?.id ?? '',
        ownerName: founder?.username ?? 'no founder',
        members: members.length,
        createdAt: stamps.length > 0 ? Math.min(...stamps) : 0,
      }
    })
    .sort((a, b) => {
      const byAge = a.createdAt - b.createdAt
      return byAge !== 0 ? byAge : a.id.localeCompare(b.id)
    })
}
