'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from './QueryConsole.module.scss'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface QueryHistoryEntry {
  id: string
  method: HttpMethod
  path: string
  status: number
  statusText: string
  timestamp: string
  body?: unknown
  queryParams?: string
}

interface QueryResponse {
  status: number
  statusText: string
  data: unknown
  url: string
  timestamp: string
}

const METHODS: { value: HttpMethod; className: string }[] = [
  { value: 'GET', className: styles.methodGet },
  { value: 'POST', className: styles.methodPost },
  { value: 'PUT', className: styles.methodPut },
  { value: 'DELETE', className: styles.methodDelete },
]

const HISTORY_KEY = 'dbal-query-history'
const MAX_HISTORY = 20

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = styles.jsonNumber
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? styles.jsonKey : styles.jsonString
      } else if (/true|false/.test(match)) {
        cls = styles.jsonBool
      } else if (/null/.test(match)) {
        cls = styles.jsonNull
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

function loadHistory(): QueryHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(entries: QueryHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function QueryConsole() {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [tenant, setTenant] = useState('pastebin')
  const [pkg, setPkg] = useState('pastebin')
  const [entity, setEntity] = useState('Snippet')
  const [entityId, setEntityId] = useState('')
  const [queryParams, setQueryParams] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<QueryResponse | null>(null)
  const [history, setHistory] = useState<QueryHistoryEntry[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const buildPath = useCallback(() => {
    let path = `/${tenant}/${pkg}/${entity}`
    if (entityId.trim()) {
      path += `/${entityId.trim()}`
    }
    if (queryParams.trim() && method === 'GET') {
      path += `?${queryParams.trim()}`
    }
    return path
  }, [tenant, pkg, entity, entityId, queryParams, method])

  const execute = useCallback(async () => {
    setLoading(true)
    setResponse(null)

    const path = buildPath()
    let parsedBody: unknown = undefined
    if (body.trim() && (method === 'POST' || method === 'PUT')) {
      try {
        parsedBody = JSON.parse(body)
      } catch {
        setResponse({
          status: 0,
          statusText: 'Client Error',
          data: { error: 'Invalid JSON in request body' },
          url: path,
          timestamp: new Date().toISOString(),
        })
        setLoading(false)
        return
      }
    }

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, path, body: parsedBody }),
      })
      const data: QueryResponse = await res.json()
      setResponse(data)

      const entry: QueryHistoryEntry = {
        id: crypto.randomUUID(),
        method,
        path,
        status: data.status,
        statusText: data.statusText,
        timestamp: data.timestamp,
        body: parsedBody,
        queryParams: queryParams.trim() || undefined,
      }
      const updated = [entry, ...history].slice(0, MAX_HISTORY)
      setHistory(updated)
      saveHistory(updated)
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Fetch Error',
        data: { error: err instanceof Error ? err.message : 'Unknown error' },
        url: path,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [method, body, buildPath, history, queryParams])

  const restoreFromHistory = useCallback((entry: QueryHistoryEntry) => {
    setMethod(entry.method)
    const parts = entry.path.replace(/\?.*$/, '').split('/').filter(Boolean)
    if (parts.length >= 1) setTenant(parts[0])
    if (parts.length >= 2) setPkg(parts[1])
    if (parts.length >= 3) setEntity(parts[2])
    if (parts.length >= 4) setEntityId(parts[3])
    else setEntityId('')
    if (entry.queryParams) setQueryParams(entry.queryParams)
    else setQueryParams('')
    if (entry.body) setBody(JSON.stringify(entry.body, null, 2))
    else setBody('')
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  const methodColor = (m: HttpMethod) => {
    switch (m) {
      case 'GET': return '#4ade80'
      case 'POST': return '#60a5fa'
      case 'PUT': return '#fbbf24'
      case 'DELETE': return '#f87171'
    }
  }

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString()
    } catch {
      return ts
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.panel}>
            <h2 className={styles.title}>Query Console</h2>

            <div className={styles.methodGroup}>
              {METHODS.map(m => (
                <button
                  key={m.value}
                  className={`${styles.methodBtn} ${m.className} ${method === m.value ? styles.methodBtnActive : ''}`}
                  onClick={() => setMethod(m.value)}
                  type="button"
                >
                  {m.value}
                </button>
              ))}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Tenant</label>
                <input
                  className={styles.input}
                  value={tenant}
                  onChange={e => setTenant(e.target.value)}
                  placeholder="pastebin"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Package</label>
                <input
                  className={styles.input}
                  value={pkg}
                  onChange={e => setPkg(e.target.value)}
                  placeholder="pastebin"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Entity</label>
                <input
                  className={styles.input}
                  value={entity}
                  onChange={e => setEntity(e.target.value)}
                  placeholder="Snippet"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>ID (optional)</label>
                <input
                  className={styles.input}
                  value={entityId}
                  onChange={e => setEntityId(e.target.value)}
                  placeholder="abc-123"
                />
              </div>
              {method === 'GET' && (
                <div className={styles.fieldFull}>
                  <label className={styles.label}>Query Parameters</label>
                  <input
                    className={styles.input}
                    value={queryParams}
                    onChange={e => setQueryParams(e.target.value)}
                    placeholder="limit=10&offset=0"
                  />
                </div>
              )}
              {(method === 'POST' || method === 'PUT') && (
                <div className={styles.fieldFull}>
                  <label className={styles.label}>JSON Body</label>
                  <textarea
                    className={styles.bodyEditor}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder={'{\n  "title": "Hello World",\n  "content": "..."\n}'}
                  />
                </div>
              )}
            </div>

            <div className={styles.executeRow}>
              <button
                className={styles.executeBtn}
                onClick={execute}
                disabled={loading || !tenant || !pkg || !entity}
                type="button"
              >
                {loading ? 'Executing...' : 'Execute'}
              </button>
              <span className={styles.pathPreview}>
                {method} {buildPath()}
              </span>
            </div>
          </div>

          {loading && (
            <div className={styles.panel}>
              <div className={styles.loading}>
                <span className={styles.spinner} />
                Sending request...
              </div>
            </div>
          )}

          {response && !loading && (
            <div className={styles.panel}>
              <div className={styles.responseHeader}>
                <h3 className={styles.responseTitle}>Response</h3>
                <span
                  className={`${styles.statusBadge} ${response.status >= 200 && response.status < 300 ? styles.statusSuccess : styles.statusError}`}
                >
                  {response.status} {response.statusText}
                </span>
              </div>
              <pre
                className={styles.responsePre}
                dangerouslySetInnerHTML={{
                  __html: syntaxHighlight(JSON.stringify(response.data, null, 2)),
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className={styles.sidebarTitle}>History</h3>
            {history.length > 0 && (
              <button className={styles.clearBtn} onClick={clearHistory} type="button">
                Clear
              </button>
            )}
          </div>
          <div className={styles.historyList}>
            {history.length === 0 && (
              <p className={styles.emptyHistory}>No queries yet</p>
            )}
            {history.map(entry => (
              <div
                key={entry.id}
                className={styles.historyItem}
                onClick={() => restoreFromHistory(entry)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={styles.historyMethod} style={{ color: methodColor(entry.method) }}>
                    {entry.method}
                  </span>
                  <span
                    className={styles.historyStatus}
                    style={{ color: entry.status >= 200 && entry.status < 300 ? '#4ade80' : '#f87171' }}
                  >
                    {entry.status}
                  </span>
                </div>
                <span className={styles.historyPath}>{entry.path}</span>
                <span className={styles.historyTime}>{formatTimestamp(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
