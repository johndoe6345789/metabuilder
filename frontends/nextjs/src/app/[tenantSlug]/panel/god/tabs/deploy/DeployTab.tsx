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
        A backup of this browser&rsquo;s editor — your drafts, staged
        changes and version history. Export it to move your work to
        another machine, or import one to restore it here.
      </Typography>
      <Typography variant="body2" color="text.secondary" className={s.hint}>
        It does not include what you have published. Live routes, page
        trees, workflows and styles are rows in the data layer; publishing
        is what writes them and this cannot restore them.
      </Typography>

      {d.flash !== null && <div className={s.flash}>{d.flash}</div>}

      <ExportImportCards deploy={d} />
      <EnvironmentInfo />
    </div>
  )
}
