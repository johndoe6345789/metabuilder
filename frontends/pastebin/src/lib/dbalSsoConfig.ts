import type { DbalSsoConfig } from '@metabuilder/dbal-sso/core'

// Must match next.config.js's basePath — window.location.origin alone
// doesn't include it, and this is registered verbatim (exact-match, no
// relaxation) as the client's redirect_uri in DBAL's clients.json.
export const dbalSsoConfig: DbalSsoConfig = {
  dbalOidcBase: (process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL ?? '').replace(/\/$/, ''),
  clientId: process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID ?? 'pastebin-web',
  basePath: '/pastebin',
}
