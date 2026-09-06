/**
 * The operator's own key, attached to every request this client makes.
 *
 * DBAL now enforces the read ACLs its schemas declare, so `User`,
 * `InstalledPackage` and twenty others refuse a caller who presents
 * nothing. Every module that imports this client is a server route or
 * server-side lib -- never a client component -- so the token is read from
 * a non-NEXT_PUBLIC variable that Next leaves out of the browser bundle
 * entirely. In a browser it is simply undefined and no header is sent,
 * which is correct: that path goes through /api/dbal, which attaches the
 * signed-in user's own token instead.
 *
 * Without this the failures are quiet rather than loud, which is worse:
 * listEntity() answers `{data: []}` on any error, so registration's
 * "community name already taken" check just stopped finding anybody.
 */
function adminAuth(): Record<string, string> {
  const token = process.env.DBAL_ADMIN_TOKEN
  if (token === undefined || token.length === 0) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function dbalFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...adminAuth(),
      ...init?.headers,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`DBAL ${res.status}: ${body}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** Unwrap C++ DBAL envelope: { data: ..., success: bool } */
export function unwrap<T>(raw: unknown): T {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'success' in (raw as Record<string, unknown>)
  ) {
    return (raw as Record<string, unknown>).data as T
  }
  return raw as T
}
