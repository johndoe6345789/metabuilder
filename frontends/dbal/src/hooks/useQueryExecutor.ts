'use client'

import { useState, useCallback } from 'react'
import type {
  HttpMethod,
  QueryHistoryEntry,
  QueryResponse,
} from '../types'

function base(): string {
  return process.env.__NEXT_ROUTER_BASEPATH || '/dbal'
}

function errorResponse(url: string, err: unknown): QueryResponse {
  return {
    status: 0, statusText: 'Fetch Error',
    data: { error: err instanceof Error ? err.message : 'Unknown' },
    url, timestamp: new Date().toISOString(),
  }
}

type OnEntry = (e: QueryHistoryEntry) => void
type ExecReturn = {
  loading: boolean
  response: QueryResponse | null
  executeQuery: (
    m: HttpMethod, path: string, reqBody: unknown,
    onEntry: OnEntry, cliCmd?: string,
  ) => Promise<void>
  executeCli: (
    command: string, token: string, onEntry: OnEntry,
  ) => Promise<void>
}

export function useQueryExecutor(token: string): ExecReturn {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<QueryResponse | null>(null)

  const executeQuery = useCallback(
    async (
      m: HttpMethod, path: string, reqBody: unknown,
      onEntry: OnEntry, cliCmd?: string,
    ) => {
      setLoading(true); setResponse(null)
      try {
        const res = await fetch(`${base()}/api/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ method: m, path, body: reqBody }),
        })
        const data: QueryResponse = await res.json()
        setResponse(data)
        onEntry({
          id: crypto.randomUUID(), method: m, path,
          status: data.status, statusText: data.statusText,
          timestamp: data.timestamp, body: reqBody, cli: cliCmd,
        })
      } catch (err) {
        setResponse(errorResponse(path, err))
      } finally { setLoading(false) }
    },
    [token],
  )

  const executeCli = useCallback(
    async (command: string, tok: string, onEntry: OnEntry) => {
      if (!command.trim()) return
      setLoading(true); setResponse(null)
      try {
        const res = await fetch(`${base()}/api/cli`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tok}`,
          },
          body: JSON.stringify({ command }),
        })
        const data: QueryResponse & { command?: string } = await res.json()
        setResponse(data)
        onEntry({
          id: crypto.randomUUID(), method: 'GET',
          path: data.command || command,
          status: data.status, statusText: data.statusText,
          timestamp: data.timestamp, cli: command,
        })
      } catch (err) {
        setResponse(errorResponse(command, err))
      } finally { setLoading(false) }
    },
    [],
  )

  return { loading, response, executeQuery, executeCli }
}
