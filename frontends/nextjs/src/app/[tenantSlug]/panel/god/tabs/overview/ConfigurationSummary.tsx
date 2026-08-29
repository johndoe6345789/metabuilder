'use client'

import { Typography } from '@/m3'
import { godPanelConfig } from '@/lib/packages/navigation'
import s from '../OverviewTab.module.scss'

/** The three facts worth stating about this installation. */
export function ConfigurationSummary({ version }: { version?: string }) {
  const rows = [
    ['DBAL Version:', version != null ? `v${version}` : '—'],
    ['God Panel Tabs:', String(godPanelConfig.tabs.length)],
    ['Quick Tools:', String(godPanelConfig.tools.length)],
  ]

  return (
    <div className={s.summaryPaper}>
      <Typography variant="subtitle1">Configuration Summary</Typography>
      <div className={s.summaryGrid}>
        {rows.map(([label, value]) => (
          <div key={label} className={s.summaryRow}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
          </div>
        ))}
      </div>
    </div>
  )
}
