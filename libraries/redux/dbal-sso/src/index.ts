// Framework-agnostic core -- usable with or without Redux (e.g. the `dbal`
// admin console, which has no Redux today).
export type { DbalSsoConfig } from './core/config'
export { beginLogin, completeLogin, refreshTokens, logout, oidcRedirectUri } from './core/oidcClient'
export type { OidcUser, OidcTokens } from './core/oidcClient'
export { getAuthToken, setAuthToken } from './core/authToken'
export { decodeJwtPayload, isTokenValid } from './core/decodeJwt'
export { createAuthenticatedFetch } from './core/authenticatedFetch'
export type { AuthenticatedFetchOptions } from './core/authenticatedFetch'

// Optional Redux adapter -- re-exported from the same entry point since
// react-redux/@reduxjs-toolkit are peerDependenciesMeta-optional, not
// required just to import the core.
export { createDbalSsoSlice } from './redux'
export type { DbalSsoState, DbalSsoSlice } from './redux'
