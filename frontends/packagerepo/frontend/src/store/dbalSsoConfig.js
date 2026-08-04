export const dbalSsoConfig = {
  dbalOidcBase: process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL || '/api/dbal',
  clientId: process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID || 'packagerepo-web',
  basePath: '/packagerepo',
};
