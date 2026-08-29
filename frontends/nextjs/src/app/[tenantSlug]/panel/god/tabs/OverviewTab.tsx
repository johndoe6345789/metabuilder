'use client'

import { Alert, Typography } from '@/m3'
import { DbalStatusCard } from './DbalStatusCard'
import { ConfigurationSummary } from './overview/ConfigurationSummary'
import { QuickTools } from './overview/QuickTools'
import { DBAL_URL } from './overview/dbal-status'
import { useDbalStatus } from './overview/use-dbal-status'
import { useOverviewTools } from './overview/use-overview-tools'
import s from './OverviewTab.module.scss'

/** What this installation is, and the handful of things to do to it. */
export function OverviewTab() {
  const status = useDbalStatus()
  const tools = useOverviewTools(status.version ?? null)

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        System Overview
      </Typography>

      {tools.flash !== null && (
        <Alert severity={tools.flash.severity} className={s.alert}>
          {tools.flash.message}
        </Alert>
      )}

      <input
        ref={tools.importRef}
        type="file"
        accept="application/json"
        className={s.fileInput}
        onChange={event => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file !== undefined) void tools.readImportFile(file)
        }}
      />

      <DbalStatusCard
        state={status.state}
        version={status.version}
        endpoint={DBAL_URL}
      />

      <QuickTools onRun={tools.runTool} />
      <ConfigurationSummary version={status.version} />
    </div>
  )
}
