/**
 * Does this tenant exist?
 *
 * `[tenantSlug]` matches any first path segment, so /app/dashboard reads as a
 * tenant named "dashboard": the shell renders, finds nothing published, and
 * sends the visitor to a login prompt for a tenant that was never real. A
 * wrong URL should say so instead.
 *
 * There is no Tenant entity to ask, so a tenant is taken to exist if anything
 * belongs to it -- a user, or a published page. Pages are checked as well as
 * users because a tenant can have content before it has accounts.
 *
 * Note the tenant goes in the PATH, not a filter. DBAL scopes by the URL and
 * ignores `filter.tenantId` entirely: asking it for users of a tenant that
 * does not exist returned the `system` god user, so a filtered check called
 * every made-up tenant real.
 */

function rowCount(payload: unknown): number {
  const data = (payload as { data?: { data?: unknown } } | null)?.data?.data
  return Array.isArray(data) ? data.length : 0
}

/** A tenant name DBAL will accept in a path at all. */
const NAME = /^[a-zA-Z0-9_]+$/

export async function tenantExists(
  dbal: string,
  tenant: string,
  signal?: AbortSignal
): Promise<boolean> {
  // DBAL answers 400 for a name it cannot route, so anything outside this
  // shape is definitively not a tenant and is not worth a request.
  if (!NAME.test(tenant)) return false

  const base = `${dbal}/${encodeURIComponent(tenant)}/core`
  try {
    const [users, pages] = await Promise.all([
      fetch(`${base}/User?limit=1`, { signal, cache: 'no-store' }),
      fetch(`${base}/PageConfig?limit=1`, { signal, cache: 'no-store' }),
    ])

    // A server error means we could not find out, which is different from
    // finding out there is nothing. An outage must not turn every page in the
    // system into a 404, so treat it as "exists" and let the page decide.
    if (users.status >= 500 || pages.status >= 500) return true

    if (users.ok && rowCount(await users.json()) > 0) return true
    if (pages.ok && rowCount(await pages.json()) > 0) return true
    return false
  } catch {
    return true
  }
}
