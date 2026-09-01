'use client'

import { Typography } from '@/m3'
import { useDeploy } from './use-deploy'
import { ExportImportCards } from './ExportImportCards'
import { EnvironmentInfo } from './EnvironmentInfo'
import s from './DeployTab.module.scss'

export function DeployTab() {
  const d = useDeploy()

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>
        Deploy
      </Typography>
      <Typography variant="body2" color="text.secondary" className={s.hint}>
        A project is just declarative data — routes, component trees,
        workflows, styles, packages. Export the whole bundle to move it
        between environments, or import one to restore it.
      </Typography>

      {d.flash !== null && <div className={s.flash}>{d.flash}</div>}

      <ExportImportCards deploy={d} />
      <EnvironmentInfo />
    </div>
  )
}
