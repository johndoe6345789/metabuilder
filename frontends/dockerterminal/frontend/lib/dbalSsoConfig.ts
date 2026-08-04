import type { DbalSsoConfig } from '@metabuilder/dbal-sso/core'

export const dbalSsoConfig: DbalSsoConfig = {
  dbalOidcBase: process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL ?? '/api/dbal',
  clientId: process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID ?? 'dockerterminal-web',
  basePath: '/terminal',
}
