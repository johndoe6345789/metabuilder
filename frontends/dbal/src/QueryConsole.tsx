'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
  cli?: string
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
const TOKEN_KEY = 'dbal-admin-token'
const MAX_HISTORY = 20
const DEFAULT_TOKEN = '069e6487a710300381cd52120eab95d56d7f53beee21479cbeba9128217cbea9'

const CLI_EXAMPLES = [
  'dbal ping',
  'dbal list Snippet',
  'dbal rest pastebin pastebin Snippet',
  'dbal rest pastebin pastebin User',
  'dbal create Snippet title="Hello" content="world"',
  'auth session',
  'tenant list',
  'user list',
  'package list',
]

function parseCli(input: string): { method: HttpMethod; path: string; body?: Record<string, unknown> } | null {
  const parts = input.trim().split(/\s+/)
  if (parts.length < 2) return null

  const cmd = parts[0].toLowerCase()
  if (cmd !== 'dbal') return null

  const sub = parts[1].toLowerCase()

  if (sub === 'ping') {
    return { method: 'GET', path: '/health' }
  }

  if (sub === 'rest' && parts.length >= 5) {
    const [, , tenant, pkg, entity, ...rest] = parts
    let path = `/${tenant}/${pkg}/${entity}`
    const id = rest.find(r => !r.includes('=') && !['GET', 'POST', 'PUT', 'DELETE'].includes(r.toUpperCase()))
    const methodOverride = rest.find(r => ['GET', 'POST', 'PUT', 'DELETE'].includes(r.toUpperCase()))
    if (id) path += `/${id}`
    const method = (methodOverride?.toUpperCase() as HttpMethod) || 'GET'
    const bodyParts = rest.filter(r => r.includes('=') && !['GET', 'POST', 'PUT', 'DELETE'].includes(r.toUpperCase()))
    const body: Record<string, unknown> = {}
    for (const bp of bodyParts) {
      const [k, ...v] = bp.split('=')
      const val = v.join('=').replace(/^"|"$/g, '')
      body[k] = val === 'true' ? true : val === 'false' ? false : isNaN(Number(val)) ? val : Number(val)
    }
    return { method, path, body: Object.keys(body).length > 0 ? body : undefined }
  }

  // dbal list/read/create/update/delete <entity> [id] [field=value...]
  const entity = parts[2] || 'Snippet'
  const tenant = 'pastebin'
  const pkg = 'pastebin'

  switch (sub) {
    case 'list':
      return { method: 'GET', path: `/${tenant}/${pkg}/${entity}` }
    case 'read':
      return { method: 'GET', path: `/${tenant}/${pkg}/${entity}/${parts[3] || ''}` }
    case 'create': {
      const body: Record<string, unknown> = {}
      for (const p of parts.slice(3)) {
        if (p.includes('=')) {
          const [k, ...v] = p.split('=')
          const val = v.join('=').replace(/^"|"$/g, '')
          body[k] = val === 'true' ? true : val === 'false' ? false : isNaN(Number(val)) ? val : Number(val)
        }
      }
      return { method: 'POST', path: `/${tenant}/${pkg}/${entity}`, body }
    }
    case 'update': {
      const body: Record<string, unknown> = {}
      for (const p of parts.slice(4)) {
        if (p.includes('=')) {
          const [k, ...v] = p.split('=')
          const val = v.join('=').replace(/^"|"$/g, '')
          body[k] = val === 'true' ? true : val === 'false' ? false : isNaN(Number(val)) ? val : Number(val)
        }
      }
      return { method: 'PUT', path: `/${tenant}/${pkg}/${entity}/${parts[3] || ''}`, body }
    }
    case 'delete':
      return { method: 'DELETE', path: `/${tenant}/${pkg}/${entity}/${parts[3] || ''}` }
    default:
      return null
  }
}

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

function isPlainOutput(data: unknown): boolean {
  return typeof data === 'object' && data !== null && 'output' in data && typeof (data as { output: unknown }).output === 'string'
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
  } catch { /* quota exceeded */ }
}

function loadToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(TOKEN_KEY) || ''
}

function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch { /* ignore */ }
}

export function QueryConsole() {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const [mode, setMode] = useState<'gui' | 'cli'>('cli')
  const [cliInput, setCliInput] = useState('')
  const cliRef = useRef<HTMLInputElement>(null)

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
    const saved = loadToken()
    if (saved) {
      setToken(saved)
      setAuthed(true)
    }
  }, [])

  const handleLogin = useCallback(() => {
    const t = tokenInput.trim() || DEFAULT_TOKEN
    setToken(t)
    saveToken(t)
    setAuthed(true)
  }, [tokenInput])

  const handleLogout = useCallback(() => {
    setToken('')
    setAuthed(false)
    localStorage.removeItem(TOKEN_KEY)
  }, [])

  const buildPath = useCallback(() => {
    let path = `/${tenant}/${pkg}/${entity}`
    if (entityId.trim()) path += `/${entityId.trim()}`
    if (queryParams.trim() && method === 'GET') path += `?${queryParams.trim()}`
    return path
  }, [tenant, pkg, entity, entityId, queryParams, method])

  const executeQuery = useCallback(async (m: HttpMethod, path: string, reqBody?: unknown, cliCmd?: string) => {
    setLoading(true)
    setResponse(null)

    try {
      const basePath = process.env.__NEXT_ROUTER_BASEPATH || '/dbal'
      const res = await fetch(`${basePath}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: m, path, body: reqBody, token }),
      })
      const data: QueryResponse = await res.json()
      setResponse(data)

      const entry: QueryHistoryEntry = {
        id: crypto.randomUUID(),
        method: m,
        path,
        status: data.status,
        statusText: data.statusText,
        timestamp: data.timestamp,
        body: reqBody,
        cli: cliCmd,
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
  }, [token, history])

  const executeGui = useCallback(async () => {
    const path = buildPath()
    let parsedBody: unknown = undefined
    if (body.trim() && (method === 'POST' || method === 'PUT')) {
      try {
        parsedBody = JSON.parse(body)
      } catch {
        setResponse({
          status: 0, statusText: 'Client Error',
          data: { error: 'Invalid JSON in request body' },
          url: path, timestamp: new Date().toISOString(),
        })
        return
      }
    }
    executeQuery(method, path, parsedBody)
  }, [method, body, buildPath, executeQuery])

  const executeCli = useCallback(async () => {
    if (!cliInput.trim()) return
    setLoading(true)
    setResponse(null)

    try {
      const basePath = process.env.__NEXT_ROUTER_BASEPATH || '/dbal'
      const res = await fetch(`${basePath}/api/cli`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cliInput, token }),
      })
      const data: QueryResponse & { command?: string } = await res.json()
      setResponse(data)

      const entry: QueryHistoryEntry = {
        id: crypto.randomUUID(),
        method: 'GET',
        path: data.command || cliInput,
        status: data.status,
        statusText: data.statusText,
        timestamp: data.timestamp,
        cli: cliInput,
      }
      const updated = [entry, ...history].slice(0, MAX_HISTORY)
      setHistory(updated)
      saveHistory(updated)
    } catch (err) {
      setResponse({
        status: 0, statusText: 'Fetch Error',
        data: { error: err instanceof Error ? err.message : 'Unknown error' },
        url: cliInput, timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }, [cliInput, token, history])

  const restoreFromHistory = useCallback((entry: QueryHistoryEntry) => {
    if (entry.cli) {
      setMode('cli')
      setCliInput(entry.cli)
    } else {
      setMode('gui')
      setMethod(entry.method)
      const parts = entry.path.replace(/\?.*$/, '').split('/').filter(Boolean)
      if (parts.length >= 1) setTenant(parts[0])
      if (parts.length >= 2) setPkg(parts[1])
      if (parts.length >= 3) setEntity(parts[2])
      if (parts.length >= 4) setEntityId(parts[3])
      else setEntityId('')
    }
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

  // Login screen
  if (!authed) {
    return (
      <div className={styles.root}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginIcon}>DB</div>
            <h2 className={styles.loginTitle}>DBAL Query Console</h2>
            <p className={styles.loginSub}>Enter your admin token to connect to the DBAL daemon.</p>
            <div className={styles.field}>
              <label className={styles.label}>Admin Token</label>
              <input
                className={styles.input}
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Leave blank for default token"
                autoFocus
              />
            </div>
            <button className={styles.loginBtn} onClick={handleLogin} type="button">
              Connect
            </button>
            <p className={styles.loginHint}>Default token is pre-configured for local development</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.layout}>
        <div className={styles.main}>
          {/* Mode tabs + logout */}
          <div className={styles.modeBar}>
            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${mode === 'cli' ? styles.modeTabActive : ''}`}
                onClick={() => { setMode('cli'); setTimeout(() => cliRef.current?.focus(), 50) }}
                type="button"
              >
                CLI
              </button>
              <button
                className={`${styles.modeTab} ${mode === 'gui' ? styles.modeTabActive : ''}`}
                onClick={() => setMode('gui')}
                type="button"
              >
                GUI
              </button>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} type="button">
              Disconnect
            </button>
          </div>

          {/* CLI mode */}
          {mode === 'cli' && (
            <div className={styles.panel}>
              <div className={styles.cliRow}>
                <span className={styles.cliPrompt}>$</span>
                <input
                  ref={cliRef}
                  className={styles.cliInput}
                  value={cliInput}
                  onChange={e => setCliInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && executeCli()}
                  placeholder="dbal list Snippet"
                  autoFocus
                />
                <button
                  className={styles.executeBtn}
                  onClick={executeCli}
                  disabled={loading || !cliInput.trim()}
                  type="button"
                >
                  {loading ? '...' : 'Run'}
                </button>
              </div>
              <div className={styles.cliHelp}>
                <span className={styles.cliHelpLabel}>Examples:</span>
                {CLI_EXAMPLES.map(ex => (
                  <button
                    key={ex}
                    className={styles.cliExample}
                    onClick={() => { setCliInput(ex); cliRef.current?.focus() }}
                    type="button"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GUI mode */}
          {mode === 'gui' && (
            <div className={styles.panel}>
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
                  <input className={styles.input} value={tenant} onChange={e => setTenant(e.target.value)} placeholder="pastebin" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Package</label>
                  <input className={styles.input} value={pkg} onChange={e => setPkg(e.target.value)} placeholder="pastebin" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Entity</label>
                  <input className={styles.input} value={entity} onChange={e => setEntity(e.target.value)} placeholder="Snippet" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>ID (optional)</label>
                  <input className={styles.input} value={entityId} onChange={e => setEntityId(e.target.value)} placeholder="abc-123" />
                </div>
                {method === 'GET' && (
                  <div className={styles.fieldFull}>
                    <label className={styles.label}>Query Parameters</label>
                    <input className={styles.input} value={queryParams} onChange={e => setQueryParams(e.target.value)} placeholder="limit=10&offset=0" />
                  </div>
                )}
                {(method === 'POST' || method === 'PUT') && (
                  <div className={styles.fieldFull}>
                    <label className={styles.label}>JSON Body</label>
                    <textarea className={styles.bodyEditor} value={body} onChange={e => setBody(e.target.value)} placeholder={'{\n  "title": "Hello World",\n  "content": "..."\n}'} />
                  </div>
                )}
              </div>

              <div className={styles.executeRow}>
                <button className={styles.executeBtn} onClick={executeGui} disabled={loading || !tenant || !pkg || !entity} type="button">
                  {loading ? 'Executing...' : 'Execute'}
                </button>
                <span className={styles.pathPreview}>{method} {buildPath()}</span>
              </div>
            </div>
          )}

          {/* Response */}
          {loading && (
            <div className={styles.panel}>
              <div className={styles.loading}><span className={styles.spinner} /> Sending request...</div>
            </div>
          )}

          {response && !loading && (
            <div className={styles.panel}>
              <div className={styles.responseHeader}>
                <h3 className={styles.responseTitle}>Response</h3>
                <span className={`${styles.statusBadge} ${response.status >= 200 && response.status < 300 ? styles.statusSuccess : styles.statusError}`}>
                  {response.status} {response.statusText}
                </span>
              </div>
              <pre className={styles.responsePre}>
                {isPlainOutput(response.data)
                  ? (response.data as { output: string }).output
                  : <span dangerouslySetInnerHTML={{ __html: syntaxHighlight(JSON.stringify(response.data, null, 2)) }} />
                }
              </pre>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div className={styles.sidebar}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className={styles.sidebarTitle}>History</h3>
            {history.length > 0 && (
              <button className={styles.clearBtn} onClick={clearHistory} type="button">Clear</button>
            )}
          </div>
          <div className={styles.historyList}>
            {history.length === 0 && <p className={styles.emptyHistory}>No queries yet</p>}
            {history.map(entry => (
              <div key={entry.id} className={styles.historyItem} onClick={() => restoreFromHistory(entry)}>
                {entry.cli ? (
                  <span className={styles.historyPath}>$ {entry.cli}</span>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={styles.historyMethod} style={{ color: methodColor(entry.method) }}>{entry.method}</span>
                      <span className={styles.historyStatus} style={{ color: entry.status >= 200 && entry.status < 300 ? '#4ade80' : '#f87171' }}>{entry.status}</span>
                    </div>
                    <span className={styles.historyPath}>{entry.path}</span>
                  </>
                )}
                <span className={styles.historyTime}>
                  {(() => { try { return new Date(entry.timestamp).toLocaleTimeString() } catch { return entry.timestamp } })()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
