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
 *
 * Server-only, which is what lets it ask as the operator -- see `headers`.
 */

/**
 * The operator's own key, when this deployment has one.
 *
 * User declares a read ACL, so DBAL refuses to list it for a caller it
 * cannot identify. Unauthenticated, the users half of this check answers
 * 401 for every tenant alike, and a tenant that has not published a page
 * yet -- every tenant, for the minutes after signing up -- reads as one
 * that does not exist. Their own panel 404s, so they cannot publish the
 * page that would have made them real.
 *
 * Not folded into a 401-means-unknown rule: a made-up tenant answers 401
 * too, so that would call every wrong URL a real tenant, which is the
 * bug this whole module was written to stop.
 */
function headers(): Record<string, string> | undefined {
  const token = process.env.DBAL_ADMIN_TOKEN ?? ''
  return token === '' ? undefined : { Authorization: `Bearer ${token}` }
}

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
  const init = { signal, cache: 'no-store' as const, headers: headers() }
  try {
    const [users, pages] = await Promise.all([
      fetch(`${base}/User?limit=1`, init),
      fetch(`${base}/PageConfig?limit=1`, init),
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
