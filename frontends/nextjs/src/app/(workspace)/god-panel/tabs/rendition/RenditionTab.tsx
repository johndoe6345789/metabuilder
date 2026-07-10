'use client'

import { Alert } from '@/m3'
import { RenditionHeader } from './RenditionHeader'
import { RenditionIdentityPanel } from './RenditionIdentityPanel'
import { RenditionManifestPanel } from './RenditionManifestPanel'
import { RenditionModulesPanel } from './RenditionModulesPanel'
import { RenditionNavigationPanel } from './RenditionNavigationPanel'
import { RenditionPreview } from './RenditionPreview'
import { useRenditionConfig } from './use-rendition-config'
import s from './RenditionTab.module.scss'

export function RenditionTab() {
  const cfg = useRenditionConfig()

  return (
    <div className={s.root}>
      <RenditionHeader cfg={cfg} />
      {cfg.flash !== null && (
        <Alert severity="success" className={s.alert}>
          {cfg.flash}
        </Alert>
      )}
      <div className={s.grid}>
        <RenditionIdentityPanel cfg={cfg} />
        <RenditionPreview cfg={cfg} />
      </div>
      <RenditionModulesPanel cfg={cfg} />
      <RenditionNavigationPanel cfg={cfg} />
      <RenditionManifestPanel cfg={cfg} />
    </div>
  )
}
