import type { DbalSsoConfig } from './config'
import { randomString, sha256Base64Url } from './pkce'
import { decodeJwtPayload } from './decodeJwt'

export interface OidcUser {
  id: string
  username: string
}

export interface OidcTokens {
  token: string
  refreshToken: string | null
  user: OidcUser
}

// Namespaced per clientId so two DBAL-backed apps sharing an origin (or a
// dev server proxying more than one) can't clobber each other's in-flight
// login attempt -- pastebin's original implementation used a single fixed
// key pair, which was fine with one consumer but not with several.
function pkceVerifierKey(config: DbalSsoConfig): string {
  return `dbal_oidc_pkce_verifier:${config.clientId}`
}
function pkceStateKey(config: DbalSsoConfig): string {
  return `dbal_oidc_state:${config.clientId}`
}

export function oidcRedirectUri(config: DbalSsoConfig): string {
  return `${window.location.origin}${config.basePath}/auth/callback`
}

/**
 * Redirects the browser to DBAL's /oidc/authorize, having stashed the PKCE
 * code_verifier (and state, for CSRF protection) in sessionStorage -- read
 * back by completeLogin() once DBAL redirects to `${basePath}/auth/callback`
 * with ?code=&state=.
 *
 * If the browser already has a live DBAL SSO session (from a prior login at
 * this app or any other DBAL-backed app), DBAL's /authorize skips its login
 * form entirely and redirects straight back here with a code -- that's the
 * actual "single" in single sign-on. This function doesn't need to know
 * which case it is; the redirect chain handles both.
 */
export async function beginLogin(config: DbalSsoConfig): Promise<void> {
  const verifier = randomString(32)
  const challenge = await sha256Base64Url(verifier)
  const state = randomString(16)

  sessionStorage.setItem(pkceVerifierKey(config), verifier)
  sessionStorage.setItem(pkceStateKey(config), state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: oidcRedirectUri(config),
    scope: 'openid profile offline_access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  window.location.assign(`${config.dbalOidcBase}/oidc/authorize?${params.toString()}`)
}

function tokensFromResponse(data: Record<string, unknown>): OidcTokens {
  const accessToken = data.access_token as string
  const claims = decodeJwtPayload(accessToken)
  const username = (claims.sub as string) ?? ''
  if (!username) throw new Error('Sign-in failed — malformed token')
  return {
    token: accessToken,
    refreshToken: (data.refresh_token as string) ?? null,
    user: { id: username, username },
  }
}

/** Call from the `${basePath}/auth/callback` page with the `code`/`state`
 * query params DBAL redirected back with. Throws on any failure (invalid
 * state, expired PKCE session, DBAL rejecting the exchange, network error)
 * -- the caller (a Redux thunk, or a plain try/catch) decides how to
 * surface that. */
export async function completeLogin(
  config: DbalSsoConfig,
  code: string,
  state: string,
): Promise<OidcTokens> {
  const storedState = sessionStorage.getItem(pkceStateKey(config))
  const verifier = sessionStorage.getItem(pkceVerifierKey(config))
  sessionStorage.removeItem(pkceStateKey(config))
  sessionStorage.removeItem(pkceVerifierKey(config))

  if (!verifier || !storedState || storedState !== state) {
    throw new Error('Sign-in session expired or invalid — please try again')
  }

  const res = await fetch(`${config.dbalOidcBase}/oidc/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: oidcRedirectUri(config),
      client_id: config.clientId,
      code_verifier: verifier,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? 'Sign-in failed')
  }
  return tokensFromResponse(data)
}

/** Redeems a refresh token for a fresh access/ID/refresh token set. Note:
 * DBAL rotates refresh tokens and revokes the whole rotation family on
 * reuse of an already-consumed one -- see authenticatedFetch.ts's
 * in-flight-dedup for why concurrent calls to this from the same tab must
 * go through that, not call this directly. */
export async function refreshTokens(config: DbalSsoConfig, refreshToken: string): Promise<OidcTokens> {
  const res = await fetch(`${config.dbalOidcBase}/oidc/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? 'Session refresh failed')
  }
  return tokensFromResponse(data)
}

/** Revokes the DBAL-side SSO session (so it can't resurrect login on a
 * subsequent /authorize call from this or another DBAL-backed app) and, if
 * supplied, the given refresh token. Relies on the browser having sent the
 * dbal_oidc_sid cookie along with this same-origin request -- this only
 * works when dbalOidcBase is same-origin (the standard `/api/dbal` nginx
 * proxy convention); a cross-origin dbalOidcBase would need explicit
 * `credentials: 'include'` handling this package doesn't do. */
export async function logout(config: DbalSsoConfig, refreshToken?: string | null): Promise<void> {
  try {
    await fetch(`${config.dbalOidcBase}/oidc/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(refreshToken ? { refresh_token: refreshToken } : {}),
    })
  } catch {
    // Non-fatal: the caller clears its own local state regardless (see
    // redux/authSlice.ts's logout reducer) -- a failed server-side revoke
    // just means the session lingers until its own expiry ceiling.
  }
}
