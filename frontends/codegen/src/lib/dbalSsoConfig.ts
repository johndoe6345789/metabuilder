import type { DbalSsoConfig } from '@metabuilder/dbal-sso/core'

// Must match next.config.js's basePath -- registered verbatim (exact-match,
// no relaxation) as codegen-web's redirect_uri in DBAL's clients.json.
export const dbalSsoConfig: DbalSsoConfig = {
  dbalOidcBase: (process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL ?? '').replace(/\/$/, ''),
  clientId: process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID ?? 'codegen-web',
  basePath: '/codegen',
}
