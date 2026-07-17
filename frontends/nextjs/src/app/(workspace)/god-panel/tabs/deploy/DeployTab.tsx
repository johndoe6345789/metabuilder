'use client'

import { useRef } from 'react'
import { Button, Typography } from '@/m3'
import { useDeploy } from './use-deploy'
import s from './DeployTab.module.scss'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export function DeployTab() {
  const d = useDeploy()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>
        Deploy
      </Typography>
      <Typography variant="body2" color="text.secondary" className={s.hint}>
        A project is just declarative data — routes, component trees, workflows,
        styles, packages. Export the whole bundle to move it between
        environments, or import one to restore it.
      </Typography>

      {d.flash && <div className={s.flash}>{d.flash}</div>}

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
              if (f) void d.importProject(f)
            }}
          />
        </div>
      </div>

      <div className={s.env}>
        <div className={s.envTitle}>Environment</div>
        <div className={s.envRow}>
          <span>DBAL API</span>
          <code>{DBAL}</code>
        </div>
        <div className={s.envRow}>
          <span>Storage</span>
          <code>IndexedDB → localStorage fallback</code>
        </div>
      </div>
    </div>
  )
}
