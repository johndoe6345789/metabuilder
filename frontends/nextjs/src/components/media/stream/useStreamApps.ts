'use client'

import { useState, useCallback, useEffect } from 'react'
import { getAuthToken } from '@metabuilder/dbal-sso/core'

// DBAL's generic entity REST layer: /api/v1/{tenant}/{package}/{entity},
// implemented by the Next.js catch-all at
// frontends/nextjs/src/app/api/v1/[...slug]/route.ts. That route only
// exists inside the Next.js app, which is mounted under basePath "/app"
// (next.config.js) — so it must be reached as /app/api/v1/... . A bare
// /api/... path never reaches Next.js at all: nginx's own "/api/" location
// (deployment/config/nginx/production.conf) proxies straight to raw DBAL
// under a *different* convention, /api/{tenant}/{package}/{entity} (no
// "v1"), stripping just "/api/". Hitting it with the Next.js-shaped path
// shifts every segment by one, so DBAL parsed our packageId ("platform")
// as the entity name and 422'd with "Unknown entity: platform".
//
// "platform" isn't a registered package under packages/ — validatePackageRoute
// (frontends/nextjs/src/lib/routing/auth/validate-package-route.ts) only
// restricts entities for packages that exist and declare a schema.entities
// allowlist; an unregistered package id falls through to "allowed" by
// design ("custom REST is optional").
//
// Auth here is a Bearer token, not the session cookie: getSessionUser()
// (frontends/nextjs/src/lib/routing/index.ts) reads req.headers['authorization']
// specifically — the browser's own OIDC session cookie doesn't cover this
// route on its own (confirmed live: an authenticated browser still got 401
// until the token was attached explicitly). getAuthToken() reads the
// same in-memory bridge auth-store.ts populates on login.
const ENTITY_PATH = '/app/api/v1/system/platform/StreamApp'

function authHeaders(): HeadersInit {
  const token = getAuthToken()
  return token !== null ? { Authorization: `Bearer ${token}` } : {}
}

export type EmbedMode = 'newtab' | 'iframe'

export interface StreamApp {
  id: string
  name: string
  url: string
  bgColor: string
  fgColor: string
  embedMode: EmbedMode
  sortOrder?: number
}

interface ListResponse {
  data?: StreamApp[]
}

export function useStreamApps() {
  const [apps, setApps] = useState<StreamApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(ENTITY_PATH, { cache: 'no-store', headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json() as ListResponse | StreamApp[]
      const list = Array.isArray(body) ? body : (body.data ?? [])
      list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      setApps(list)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load apps')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const createApp = useCallback(async (app: StreamApp): Promise<void> => {
    const res = await fetch(ENTITY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(app),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await refresh()
  }, [refresh])

  const updateApp = useCallback(async (id: string, patch: Partial<StreamApp>): Promise<void> => {
    const res = await fetch(`${ENTITY_PATH}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await refresh()
  }, [refresh])

  const deleteApp = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${ENTITY_PATH}/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await refresh()
  }, [refresh])

  return { apps, loading, error, refresh, createApp, updateApp, deleteApp }
}
