'use client'

import { useState, useCallback } from 'react'
import type { HttpMethod } from '../types'

interface UseGuiQueryReturn {
  method: HttpMethod
  tenant: string
  pkg: string
  entity: string
  entityId: string
  queryParams: string
  body: string
  setMethod: (m: HttpMethod) => void
  setTenant: (v: string) => void
  setPkg: (v: string) => void
  setEntity: (v: string) => void
  setEntityId: (v: string) => void
  setQueryParams: (v: string) => void
  setBody: (v: string) => void
  buildPath: () => string
  parseBody: () => { ok: true; value: unknown } | { ok: false; err: string }
  setGuiFromParts: (
    method: HttpMethod,
    tenant: string,
    pkg: string,
    entity: string,
    entityId: string,
  ) => void
}

export function useGuiQuery(): UseGuiQueryReturn {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [tenant, setTenant] = useState('pastebin')
  const [pkg, setPkg] = useState('pastebin')
  const [entity, setEntity] = useState('Snippet')
  const [entityId, setEntityId] = useState('')
  const [queryParams, setQueryParams] = useState('')
  const [body, setBody] = useState('')

  const buildPath = useCallback(() => {
    let path = `/${tenant}/${pkg}/${entity}`
    if (entityId.trim()) path += `/${entityId.trim()}`
    if (queryParams.trim() && method === 'GET') {
      path += `?${queryParams.trim()}`
    }
    return path
  }, [tenant, pkg, entity, entityId, queryParams, method])

  const parseBody = useCallback(():
    | { ok: true; value: unknown }
    | { ok: false; err: string } => {
    if (!body.trim() || (method !== 'POST' && method !== 'PUT')) {
      return { ok: true, value: undefined }
    }
    try {
      return { ok: true, value: JSON.parse(body) }
    } catch {
      return { ok: false, err: 'Invalid JSON in request body' }
    }
  }, [body, method])

  const setGuiFromParts = useCallback(
    (
      m: HttpMethod,
      t: string,
      p: string,
      e: string,
      id: string,
    ) => {
      setMethod(m)
      setTenant(t)
      setPkg(p)
      setEntity(e)
      setEntityId(id)
    },
    [],
  )

  return {
    method, tenant, pkg, entity, entityId,
    queryParams, body,
    setMethod, setTenant, setPkg, setEntity,
    setEntityId, setQueryParams, setBody,
    buildPath, parseBody, setGuiFromParts,
  }
}
