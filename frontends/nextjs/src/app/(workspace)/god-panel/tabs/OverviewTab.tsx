'use client'

import { useState, useEffect, useRef } from 'react'
import { Typography, Paper, Chip, Alert } from '@/m3'
import { godPanelConfig } from '@/lib/packages/navigation'
import { BASE_PATH } from '@/lib/app-config'
import s from './OverviewTab.module.scss'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface DbalStatus {
  connected: boolean
  version?: string
  uptime?: string
}

type Flash = { severity: 'success' | 'info' | 'warning'; message: string }
type QuickTool = (typeof godPanelConfig.tools)[number]

export function OverviewTab() {
  const importRef = useRef<HTMLInputElement | null>(null)
  const [flash, setFlash] = useState<Flash | null>(null)
  const [dbalStatus, setDbalStatus] = useState<DbalStatus>({
    connected: false,
  })

  useEffect(() => {
    fetch(`${DBAL_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then(res => (res.ok ? res.json() : null))
      .then((json: Record<string, string> | null) => {
        if (json != null) setDbalStatus(s => ({ ...s, connected: true }))
      })
      .catch(() => {
        setDbalStatus({ connected: false })
      })

    // The DBAL exposes its version at /version (not /health).
    fetch(`${DBAL_URL}/version`, { signal: AbortSignal.timeout(3000) })
      .then(res => (res.ok ? res.json() : null))
      .then((json: Record<string, unknown> | null) => {
        if (json != null && typeof json.version === 'string') {
          setDbalStatus(s => ({ ...s, version: json.version as string }))
        }
      })
      .catch(() => {
        /* ignore */
      })
  }, [])

  const downloadJson = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportDatabase = async () => {
    const resources = [
      ['users', '/system/core/User'],
      ['workflows', '/system/core/Workflow'],
      ['pages', '/system/core/PageConfig'],
      ['styleClasses', '/system/core/StyleClass'],
    ] as const

    const exported: Record<string, unknown> = {}
    for (const [key, path] of resources) {
      const res = await fetch(`${DBAL_URL}${path}`, {
        signal: AbortSignal.timeout(8000),
      })
      exported[key] = res.ok
        ? await res.json()
        : { error: `HTTP ${res.status}` }
    }

    downloadJson(`metabuilder-export-${new Date().toISOString()}.json`, {
      exportedAt: new Date().toISOString(),
      dbalVersion: dbalStatus.version ?? null,
      data: exported,
    })
    setFlash({ severity: 'success', message: 'Database export downloaded.' })
  }

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file == null) return

    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const data = parsed.data
      const collections =
        data !== null && typeof data === 'object' ? Object.keys(data).length : 0
      setFlash({
        severity: 'info',
        message: `Import file validated (${collections} collections). Apply imports from Deploy when you are ready to mutate data.`,
      })
    } catch {
      setFlash({
        severity: 'warning',
        message: 'Import file is not valid MetaBuilder JSON.',
      })
    }
  }

  const handleTool = (tool: QuickTool) => {
    setFlash(null)
    const { action } = tool
    if (action === 'exportDatabase') {
      void exportDatabase().catch(() => {
        setFlash({
          severity: 'warning',
          message: 'Database export failed. Check DBAL connectivity.',
        })
      })
      return
    }

    if (action === 'importDatabase') {
      importRef.current?.click()
      return
    }

    const origin = window.location.origin
    const previewTarget: Record<number, string> = {
      1: `${origin}${BASE_PATH}/`,
      2: `${origin}${BASE_PATH}/profile`,
      3: `${origin}${BASE_PATH}/admin`,
    }

    const level =
      tool.params !== undefined &&
      'level' in tool.params &&
      typeof tool.params.level === 'number'
        ? tool.params.level
        : 1
    const target = action === 'previewLevel' ? previewTarget[level] : undefined
    if (target !== undefined) {
      window.location.assign(target)
      return
    }

    setFlash({ severity: 'info', message: 'Tool action is not configured.' })
  }

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        System Overview
      </Typography>
      {flash !== null && (
        <Alert severity={flash.severity} className={s.alert}>
          {flash.message}
        </Alert>
      )}
      <input
        ref={importRef}
        type="file"
        accept="application/json"
        className={s.fileInput}
        onChange={event => {
          void handleImportFile(event)
        }}
      />

      <Paper className={s.statusCard}>
        <div className={s.statusRow} role="status">
          <span className={`material-symbols-rounded ${s.statusIcon}`}>
            storage
          </span>
          <div className={s.statusCopy}>
            <span className={s.statusLabel}>DBAL Daemon</span>
            <span className={s.statusHint}>Database abstraction service</span>
          </div>
          <span
            className={`${s.statusBadge} ${
              dbalStatus.connected ? s.statusOnline : s.statusOffline
            }`}
          >
            <span className={s.statusDot} aria-hidden="true" />
            {dbalStatus.connected ? 'Connected' : 'Offline'}
          </span>
        </div>
        {dbalStatus.connected && dbalStatus.version != null && (
          <div className={s.chipRow}>
            <Chip label={`v${dbalStatus.version}`} size="small" />
            <Chip label="running" size="small" variant="outlined" />
          </div>
        )}
      </Paper>

      <Typography variant="subtitle2" gutterBottom>
        Quick Actions
      </Typography>
      <div className={s.toolsGrid}>
        {godPanelConfig.tools.map(tool => (
          <button
            key={tool.id}
            type="button"
            className={s.toolCard}
            onClick={() => {
              handleTool(tool)
            }}
          >
            <span className={`material-symbols-rounded ${s.toolIcon}`}>
              {tool.icon}
            </span>
            <Typography variant="body2">{tool.label}</Typography>
          </button>
        ))}
      </div>

      <div className={s.summaryPaper}>
        <Typography variant="subtitle1">Configuration Summary</Typography>
        <div className={s.summaryGrid}>
          <div className={s.summaryRow}>
            <Typography variant="body2" color="text.secondary">
              DBAL Version:
            </Typography>
            <Typography variant="body2">
              {dbalStatus.version != null ? `v${dbalStatus.version}` : '—'}
            </Typography>
          </div>
          <div className={s.summaryRow}>
            <Typography variant="body2" color="text.secondary">
              God Panel Tabs:
            </Typography>
            <Typography variant="body2">
              {godPanelConfig.tabs.length}
            </Typography>
          </div>
          <div className={s.summaryRow}>
            <Typography variant="body2" color="text.secondary">
              Quick Tools:
            </Typography>
            <Typography variant="body2">
              {godPanelConfig.tools.length}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}
