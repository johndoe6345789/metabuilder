'use client'

import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionManifestPanelProps {
  cfg: RenditionConfigController
}

export function RenditionManifestPanel({ cfg }: RenditionManifestPanelProps) {
  return (
    <section className={s.panel}>
      <div className={s.panelTitle}>
        <span className="material-symbols-rounded">data_object</span>
        Rendition Manifest
      </div>
      <pre className={s.manifest}>{JSON.stringify(cfg.manifest, null, 2)}</pre>
    </section>
  )
}
