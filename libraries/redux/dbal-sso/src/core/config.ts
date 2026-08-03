/**
 * Per-app configuration for the DBAL OIDC/PKCE client. Every function in
 * this package takes one of these explicitly rather than reading module-level
 * state, so a single page can talk to more than one client_id if it ever
 * needs to, and there's no hidden global to accidentally share across apps.
 */
export interface DbalSsoConfig {
  /** e.g. process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL, no trailing slash. */
  dbalOidcBase: string
  /** Must match a client_id registered in DBAL's clients.json. */
  clientId: string
  /**
   * e.g. '/pastebin', '/codegen' -- used to build the redirect_uri
   * (`${origin}${basePath}/auth/callback`) and to namespace this client's
   * sessionStorage keys. Must exactly match the basePath this app is
   * actually served under (Next.js `basePath` in next.config.js) and the
   * redirect_uris registered for this client_id in DBAL's clients.json --
   * DBAL matches redirect_uri by exact string equality, no relaxation.
   */
  basePath: string
}
