import type { DbalSsoConfig } from '@metabuilder/dbal-sso/core'

export const dbalSsoConfig: DbalSsoConfig = {
  dbalOidcBase: process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL ?? '/api/dbal',
  clientId: process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID ?? 'postgres-dashboard-web',
  // oidcRedirectUri() appends '/auth/callback' to this -- the callback page
  // lives under /admin (not the app's own /postgres basePath alone) so it
  // shares /admin's exemption from next-intl locale routing in proxy.ts.
  basePath: '/postgres/admin',
}
