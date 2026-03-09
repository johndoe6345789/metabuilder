/**
 * Database Management Page
 *
 * Provides a 4-tab interface for managing the DBAL C++ daemon:
 *   1. Status    — current adapter, connection state, available backends
 *   2. Switch    — change database adapter at runtime
 *   3. Seed Data — load seed YAML into the database
 *   4. Sync      — push/pull data between Redux (IndexedDB) and DBAL
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Select,
  MenuItem,
  TextField,
  Alert,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
} from '@metabuilder/fakemui'
import { useAppDispatch, useAppSelector, type AppDispatch } from '@/store'
import {
  checkDBALConnection,
  fetchDBALAdapters,
  switchDBALDatabase,
  testDBALConnectionThunk,
  seedDBALDatabase,
  syncToDBALBulk,
  syncFromDBALBulk,
  clearSeedResult,
} from '@/store/slices/dbalSlice'
import { configureAutoSync, getAutoSyncStatus } from '@/store/middleware/autoSyncMiddleware'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─────────────────────────────────────────────────────────────────────────────
// Adapter form field config (mirrors DatabaseSettings.tsx from WorkflowUI)
// ─────────────────────────────────────────────────────────────────────────────

const ADAPTER_FIELDS: Record<string, string[]> = {
  sqlite: ['path'],
  postgres: ['host', 'port', 'database', 'user', 'password'],
  mysql: ['host', 'port', 'database', 'user', 'password'],
  mongodb: ['connectionString', 'database'],
}

const DEFAULT_PORTS: Record<string, string> = {
  postgres: '5432',
  mysql: '3306',
  mongodb: '27017',
}

function buildUrl(adapter: string, fields: Record<string, string>): string {
  if (adapter === 'sqlite') {
    return fields.path || ':memory:'
  }
  if (adapter === 'mongodb') {
    return fields.connectionString || `mongodb://localhost:27017/${fields.database || 'metabuilder'}`
  }
  const user = fields.user || ''
  const password = fields.password || ''
  const host = fields.host || 'localhost'
  const port = fields.port || DEFAULT_PORTS[adapter] || ''
  const database = fields.database || 'metabuilder'
  const auth = user ? `${user}${password ? ':' + password : ''}@` : ''
  const portPart = port ? ':' + port : ''
  return `${adapter}://${auth}${host}${portPart}/${database}`
}

function redactUrl(url: string): string {
  return url.replace(/:([^@/]+)@/, ':***@')
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Tab
// ─────────────────────────────────────────────────────────────────────────────

function StatusTab() {
  const dispatch = useAppDispatch() as any as AppDispatch & ((action: any) => Promise<any>)
  const { dbalConnected, dbalConfig, dbalAdapters } = useAppSelector((s) => s.dbal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dispatch(checkDBALConnection() as any),
      dispatch(fetchDBALAdapters() as any),
    ]).finally(() => setLoading(false))
  }, [dispatch])

  if (loading) {
    return <Typography variant="body2" color="text.secondary">Checking DBAL connection...</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardHeader title="Connection Status" />
        <CardContent>
          {dbalConnected && dbalConfig ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Connected" color="success" size="small" />
                <Chip label={dbalConfig.adapter} color="primary" size="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2">Database URL</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {redactUrl(dbalConfig.database_url)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="warning">
              DBAL daemon is not reachable. Make sure it is running on port 8080.
            </Alert>
          )}
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setLoading(true)
              ;(dispatch(checkDBALConnection() as any) as Promise<any>).finally(() => setLoading(false))
            }}
          >
            Refresh
          </Button>
        </CardActions>
      </Card>

      {dbalAdapters.length > 0 && (
        <Card>
          <CardHeader title="Available Backends" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dbalAdapters.map((a) => (
                <Chip
                  key={a.name}
                  label={a.name}
                  color={a.active ? 'primary' : 'default'}
                  variant={a.active ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Switch Database Tab
// ─────────────────────────────────────────────────────────────────────────────

function SwitchDatabaseTab() {
  const dispatch = useAppDispatch() as any as AppDispatch & ((action: any) => Promise<any>)
  const [selectedAdapter, setSelectedAdapter] = useState('sqlite')
  const [formFields, setFormFields] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [switchResult, setSwitchResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [switching, setSwitching] = useState(false)

  const handleAdapterChange = (value: string) => {
    setSelectedAdapter(value)
    setFormFields({})
    setTestResult(null)
    setSwitchResult(null)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const url = buildUrl(selectedAdapter, formFields)
      const result = await (dispatch(testDBALConnectionThunk({ adapter: selectedAdapter, databaseUrl: url }) as any) as Promise<any>)
      const payload = result?.payload
      if (payload) {
        setTestResult({ ok: payload.success, message: payload.message })
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: String(err) || 'Test failed' })
    } finally {
      setTesting(false)
    }
  }

  const handleApply = async () => {
    setSwitching(true)
    setSwitchResult(null)
    try {
      const url = buildUrl(selectedAdapter, formFields)
      await (dispatch(switchDBALDatabase({ adapter: selectedAdapter, databaseUrl: url }) as any) as Promise<any>)
      setSwitchResult({ ok: true, message: 'Switched successfully' })
      dispatch(checkDBALConnection() as any)
      dispatch(fetchDBALAdapters() as any)
    } catch (err: any) {
      setSwitchResult({ ok: false, message: String(err) || 'Switch failed' })
    } finally {
      setSwitching(false)
    }
  }

  const fields = ADAPTER_FIELDS[selectedAdapter] || []

  return (
    <Card>
      <CardHeader title="Switch Database" />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Adapter</Typography>
            <Select
              fullWidth
              value={selectedAdapter}
              onChange={(e: any) => handleAdapterChange(String(e.target.value))}
            >
              <MenuItem value="sqlite">SQLite</MenuItem>
              <MenuItem value="postgres">PostgreSQL</MenuItem>
              <MenuItem value="mysql">MySQL</MenuItem>
              <MenuItem value="mongodb">MongoDB</MenuItem>
            </Select>
          </Box>

          <Divider />

          {fields.map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              fullWidth
              value={formFields[field] || ''}
              onChange={(e: any) => setFormFields((prev) => ({ ...prev, [field]: String(e.target.value) }))}
              type={field === 'password' ? 'password' : 'text'}
              placeholder={
                field === 'host' ? 'localhost' :
                field === 'port' ? DEFAULT_PORTS[selectedAdapter] || '' :
                field === 'database' ? 'metabuilder' :
                field === 'path' ? ':memory:' :
                field === 'connectionString' ? 'mongodb://user:pass@host:27017/db' :
                ''
              }
            />
          ))}

          {testResult && (
            <Alert severity={testResult.ok ? 'success' : 'error'}>{testResult.message}</Alert>
          )}

          {switchResult && (
            <Alert severity={switchResult.ok ? 'success' : 'error'}>{switchResult.message}</Alert>
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button variant="outlined" onClick={handleTest} disabled={testing}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button variant="contained" onClick={handleApply} disabled={switching}>
          {switching ? 'Switching...' : 'Apply'}
        </Button>
      </CardActions>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data Tab
// ─────────────────────────────────────────────────────────────────────────────

function SeedDataTab() {
  const dispatch = useAppDispatch() as any as AppDispatch & ((action: any) => Promise<any>)
  const { seedResult, dbalConnected } = useAppSelector((s) => s.dbal)
  const [force, setForce] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSeed = async () => {
    setLoading(true)
    dispatch(clearSeedResult())
    try {
      await (dispatch(seedDBALDatabase({ force }) as any) as Promise<any>)
    } catch {
      // Error is captured in Redux state
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardHeader title="Load Seed Data" />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Load YAML seed data into the database. Seeds include users, workspaces, workflows, products, games, artists, videos, forum data, and more.
            </Typography>

            <FormControlLabel
              control={<Switch checked={force} onChange={(e: any) => setForce(Boolean(e.target.checked))} />}
              label="Force re-insert (ignore skipIfExists)"
            />

            {!dbalConnected && (
              <Alert severity="warning">
                DBAL daemon is not connected. Start the daemon first.
              </Alert>
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={handleSeed}
            disabled={loading || !dbalConnected}
          >
            {loading ? 'Seeding...' : 'Load Seeds'}
          </Button>
        </CardActions>
      </Card>

      {seedResult && (
        <Card>
          <CardHeader title="Seed Results" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  label={`Inserted: ${seedResult.totalInserted}`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`Skipped: ${seedResult.totalSkipped}`}
                  color="default"
                  size="small"
                />
                {seedResult.totalFailed > 0 && (
                  <Chip
                    label={`Failed: ${seedResult.totalFailed}`}
                    color="error"
                    size="small"
                  />
                )}
              </Box>

              <Divider />

              {seedResult.results.map((r) => (
                <Box key={r.entity} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 160 }}>{r.entity}</Typography>
                  <Chip label={`+${r.inserted}`} color="success" size="small" variant="outlined" />
                  {r.skipped > 0 && <Chip label={`~${r.skipped}`} size="small" variant="outlined" />}
                  {r.failed > 0 && <Chip label={`!${r.failed}`} color="error" size="small" variant="outlined" />}
                </Box>
              ))}

              {seedResult.errors.length > 0 && (
                <Alert severity="error">
                  {seedResult.errors.join('; ')}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync Tab
// ─────────────────────────────────────────────────────────────────────────────

function SyncTab() {
  const dispatch = useAppDispatch() as any as AppDispatch & ((action: any) => Promise<any>)
  const { status, lastSyncedAt, dbalConnected, error } = useAppSelector((s) => s.dbal)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [pulling, setPulling] = useState(false)

  useEffect(() => {
    const syncStatus = getAutoSyncStatus()
    setAutoSyncEnabled(syncStatus.enabled)
  }, [])

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled)
    configureAutoSync({ enabled, syncOnChange: enabled })
  }

  const handlePush = async () => {
    setPushing(true)
    try {
      await (dispatch(syncToDBALBulk() as any) as Promise<any>)
    } catch {
      // Error captured in Redux state
    } finally {
      setPushing(false)
    }
  }

  const handlePull = async () => {
    setPulling(true)
    try {
      await (dispatch(syncFromDBALBulk() as any) as Promise<any>)
    } catch {
      // Error captured in Redux state
    } finally {
      setPulling(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardHeader title="Sync Status" />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={dbalConnected ? 'DBAL Connected' : 'DBAL Disconnected'}
                color={dbalConnected ? 'success' : 'error'}
                size="small"
              />
              {status === 'syncing' && <Chip label="Syncing..." color="primary" size="small" />}
            </Box>

            {lastSyncedAt && (
              <Typography variant="body2" color="text.secondary">
                Last synced: {new Date(lastSyncedAt).toLocaleString()}
              </Typography>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={autoSyncEnabled}
                  onChange={(e: any) => handleToggleAutoSync(Boolean(e.target.checked))}
                />
              }
              label="Auto-sync on changes (push Redux state to DBAL periodically)"
            />
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            onClick={handlePush}
            disabled={pushing || !dbalConnected}
          >
            {pushing ? 'Pushing...' : 'Push to DBAL'}
          </Button>
          <Button
            variant="outlined"
            onClick={handlePull}
            disabled={pulling || !dbalConnected}
          >
            {pulling ? 'Pulling...' : 'Pull from DBAL'}
          </Button>
        </CardActions>
      </Card>

      <Card>
        <CardHeader title="About Sync" />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            CodeForge stores data locally in IndexedDB via Redux-persist. The DBAL daemon provides
            server-side persistence with support for SQLite, PostgreSQL, MySQL, and MongoDB.
            Use Push to send local data to the DBAL daemon, or Pull to load data from
            the daemon into your local store.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DatabasePage() {
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Database</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage the DBAL C++ daemon — view connection status, switch databases, load seed data, and sync with Redux.
      </Typography>

      <Tabs value={tab} onChange={(_e: any, v: any) => setTab(Number(v))}>
        <Tab label="Status" />
        <Tab label="Switch Database" />
        <Tab label="Seed Data" />
        <Tab label="Sync" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && <StatusTab />}
        {tab === 1 && <SwitchDatabaseTab />}
        {tab === 2 && <SeedDataTab />}
        {tab === 3 && <SyncTab />}
      </Box>
    </Box>
  )
}
