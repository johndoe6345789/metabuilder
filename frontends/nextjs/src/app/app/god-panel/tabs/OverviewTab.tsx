'use client'

import { useState, useEffect } from 'react'
import { Typography, Paper, Chip, Avatar } from '@/m3'
import { godPanelConfig } from '@/lib/packages/navigation'
import s from './OverviewTab.module.scss'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface DbalStatus {
  connected: boolean
  version?: string
  uptime?: string
}

export function OverviewTab() {
  const [dbalStatus, setDbalStatus] = useState<DbalStatus>({
    connected: false,
  })
  const [entityCount, setEntityCount] = useState(0)

  useEffect(() => {
    fetch(`${DBAL_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then(res => (res.ok ? res.json() : null))
      .then((json: Record<string, string> | null) => {
        if (json != null) {
          setDbalStatus({
            connected: true,
            version: json.version ?? 'unknown',
            uptime: json.uptime ?? 'unknown',
          })
        }
      })
      .catch(() => { setDbalStatus({ connected: false }) })

    fetch(`${DBAL_URL}/version`, { signal: AbortSignal.timeout(3000) })
      .then(res => (res.ok ? res.json() : null))
      .then((json: Record<string, unknown> | null) => {
        if (typeof json?.entityCount === 'number') {
          setEntityCount(json.entityCount as number)
        }
      })
      .catch(() => { /* ignore */ })
  }, [])

  return (
    <div>
      <Typography variant="h6" gutterBottom>System Overview</Typography>

      <Paper>
        <div className={s.statusRow}>
          <div
            className={`${s.dot} ${
              dbalStatus.connected ? s.dotOnline : s.dotOffline
            }`}
          />
          <Typography variant="subtitle2">
            DBAL Daemon: {dbalStatus.connected ? 'Connected' : 'Offline'}
          </Typography>
        </div>
        {dbalStatus.connected && (
          <div className={s.chipRow}>
            {dbalStatus.version != null && (
              <Chip label={`v${dbalStatus.version}`} size="small" />
            )}
            {dbalStatus.uptime != null && (
              <Chip
                label={`Up: ${dbalStatus.uptime}`}
                size="small"
                variant="outlined"
              />
            )}
            <Chip
              label={`${entityCount} entities`}
              size="small"
              variant="outlined"
            />
          </div>
        )}
      </Paper>

      <Typography variant="subtitle2" gutterBottom>
        Quick Actions
      </Typography>
      <div className={s.toolsGrid}>
        {godPanelConfig.tools.map(tool => (
          <Paper key={tool.id} className={s.toolCard}>
            <Avatar>{tool.icon.charAt(0).toUpperCase()}</Avatar>
            <Typography variant="body2">{tool.label}</Typography>
          </Paper>
        ))}
      </div>

      <div className={s.summaryPaper}>
        <Typography variant="subtitle1">Configuration Summary</Typography>
        <div className={s.summaryGrid}>
          <div className={s.summaryRow}>
            <Typography variant="body2" color="text.secondary">
              DBAL Entities:
            </Typography>
            <Typography variant="body2">{entityCount}</Typography>
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
