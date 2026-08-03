import type { DbalSsoConfig } from './config'
import { getAuthToken } from './authToken'
import { refreshTokens, type OidcTokens } from './oidcClient'

export interface AuthenticatedFetchOptions {
  /** Read the currently-known refresh token (e.g. from Redux state). */
  getRefreshToken: () => string | null
  /** Called with the new tokens after a successful refresh, so the caller
   * can update its store/persisted state. This module updates the
   * in-memory authToken bridge itself either way. */
  onRefreshed: (tokens: OidcTokens) => void
  /** Called when a 401 couldn't be resolved (no refresh token, or refresh
   * itself failed) -- typically clears local auth state / redirects to login. */
  onAuthFailure: () => void
}

/**
 * Wraps `fetch` with: attach the current bearer token, and on a 401, try
 * exactly once to refresh and retry the request before giving up. This is
 * the thing pastebin's original implementation only did in one call site
 * (share-thunks.ts) rather than centrally -- every other 401 there just
 * surfaced as a rejected promise. Centralizing it here means every
 * consumer of this package gets consistent behavior for free.
 *
 * Refresh is reactive (on 401), not proactive (a timer keyed off
 * expires_in) -- simpler, no lifecycle to manage (unmount, tab-hidden).
 * Concurrent 401s from the same tab share one in-flight refresh call via
 * the module-level cache below, so a burst of requests failing together
 * doesn't trigger multiple refreshes -- which matters because DBAL revokes
 * a refresh token's entire rotation family if it's presented twice
 * (reuse-detection), so a real race would silently log the user out
 * instead of just wasting a request. This dedup is per-tab only, not
 * cross-tab -- a genuine multi-tab race is a known, accepted gap for now
 * (would need a BroadcastChannel-based mutex to close fully).
 */
export function createAuthenticatedFetch(config: DbalSsoConfig, options: AuthenticatedFetchOptions) {
  let refreshInFlight: Promise<OidcTokens | null> | null = null

  async function doRefresh(): Promise<OidcTokens | null> {
    const refreshToken = options.getRefreshToken()
    if (!refreshToken) return null
    if (!refreshInFlight) {
      refreshInFlight = refreshTokens(config, refreshToken)
        .catch(() => null)
        .finally(() => {
          refreshInFlight = null
        })
    }
    return refreshInFlight
  }

  return async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const withAuthHeader = (token: string | null): RequestInit => {
      const headers = new Headers(init.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return { ...init, headers }
    }

    let res = await fetch(input, withAuthHeader(getAuthToken()))
    if (res.status !== 401) return res

    const refreshed = await doRefresh()
    if (!refreshed) {
      options.onAuthFailure()
      return res
    }
    options.onRefreshed(refreshed)
    res = await fetch(input, withAuthHeader(refreshed.token))
    return res
  }
}
