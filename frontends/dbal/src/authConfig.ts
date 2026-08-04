import type { DbalSsoConfig } from '@metabuilder/dbal-sso/core'

export const dbalSsoConfig: DbalSsoConfig = {
  dbalOidcBase: process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL ?? '/api/dbal',
  clientId: process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID ?? 'dbal-console',
  basePath: '/dbal',
}

const STORAGE_KEY = 'dbal-console-sso'

export interface PersistedSession {
  token: string
  refreshToken: string | null
}

/** sessionStorage, not localStorage: admin sessions shouldn't outlive the
 * tab -- this is the same tradeoff pastebin's original implementation made,
 * just no longer paired with a hardcoded fallback token. */
export function loadPersistedSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function savePersistedSession(session: PersistedSession | null) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore quota errors
  }
}
