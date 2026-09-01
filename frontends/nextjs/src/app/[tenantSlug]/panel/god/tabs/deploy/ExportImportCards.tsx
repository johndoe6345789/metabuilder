'use client'

import { useRef } from 'react'
import { Button } from '@/m3'
import type { useDeploy } from './use-deploy'
import s from './DeployTab.module.scss'

export interface ExportImportCardsProps {
  deploy: ReturnType<typeof useDeploy>
}

export function ExportImportCards({ deploy: d }: ExportImportCardsProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className={s.cards}>
      <div className={s.card}>
        <span className="material-symbols-rounded">download</span>
        <div className={s.cardBody}>
          <div className={s.cardTitle}>Export project</div>
          <div className={s.cardDesc}>
            Download everything as a single JSON bundle.
          </div>
        </div>
        <Button
          variant="contained"
          size="small"
          disabled={d.busy}
          onClick={() => {
            void d.exportProject()
          }}
        >
          Export
        </Button>
      </div>

      <div className={s.card}>
        <span className="material-symbols-rounded">upload</span>
        <div className={s.cardBody}>
          <div className={s.cardTitle}>Import project</div>
          <div className={s.cardDesc}>
            Restore a project bundle (replaces local state).
          </div>
        </div>
        <Button
          variant="outlined"
          size="small"
          disabled={d.busy}
          onClick={() => {
            fileRef.current?.click()
          }}
        >
          Import
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={e => {
            const f = e.target.files?.[0]
            if (f !== undefined) void d.importProject(f)
          }}
        />
      </div>
    </div>
  )
}
