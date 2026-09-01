import type { DbalSsoConfig } from '@metabuilder/dbal-sso/core'

export const dbalSsoConfig: DbalSsoConfig = {
  dbalOidcBase: process.env.NEXT_PUBLIC_DBAL_OIDC_BASE_URL ?? '/api/dbal',
  clientId: process.env.NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID ?? 'nextjs-web',
  basePath: '/app',
}

const STORAGE_KEY = 'nextjs-web-sso'

export interface PersistedSession {
  token: string
  refreshToken: string | null
}

/** sessionStorage, matching the dbal-console/pastebin/codegen convention. */
export function loadPersistedSession(): PersistedSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw !== null && raw.length > 0
      ? (JSON.parse(raw) as PersistedSession)
      : null
  } catch {
    return null
  }
}

export function savePersistedSession(session: PersistedSession | null): void {
  try {
    if (session !== null) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    }
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore quota errors
  }
}
