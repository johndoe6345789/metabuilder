/**
 * Does this tenant exist?
 *
 * `[tenantSlug]` matches any first path segment, so /app/dashboard reads as a
 * tenant named "dashboard": the shell renders, finds nothing published, and
 * sends the visitor to a login prompt for a tenant that was never real. A
 * wrong URL should say so instead.
 *
 * There is no Tenant entity to ask, so a tenant is taken to exist if anything
 * belongs to it -- a user, or a published page. Checking pages as well as
 * users matters because a tenant can have content before it has accounts, and
 * 404ing that would be worse than the problem being fixed.
 *
 * Fails open. If the data layer cannot be reached we do not know whether the
 * tenant exists, and an outage must not turn every page in the system into a
 * 404.
 */

function count(payload: unknown): number {
  const data = (payload as { data?: { data?: unknown } } | null)?.data?.data
  return Array.isArray(data) ? data.length : 0
}

export async function tenantExists(
  dbal: string,
  tenant: string,
  signal?: AbortSignal
): Promise<boolean> {
  if (tenant === '') return false
  try {
    const query = `?filter.tenantId=${encodeURIComponent(tenant)}&limit=1`
    const [users, pages] = await Promise.all([
      fetch(`${dbal}/system/core/User${query}`, { signal, cache: 'no-store' }),
      fetch(`${dbal}/${tenant}/core/PageConfig?limit=1`, {
        signal,
        cache: 'no-store',
      }),
    ])
    if (users.ok && count(await users.json()) > 0) return true
    if (pages.ok && count(await pages.json()) > 0) return true
    return false
  } catch {
    return true
  }
}
