'use client'

import { Button, Typography } from '@/m3'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionHeaderProps {
  cfg: RenditionConfigController
}

export function RenditionHeader({ cfg }: RenditionHeaderProps) {
  return (
    <div className={s.header}>
      <div>
        <Typography variant="h6">MetaBuilder Rendition</Typography>
        <p className={s.lede}>
          Configure the tenant-branded MetaBuilder shell, its control panel
          modules, and the navigation your users will see.
        </p>
      </div>
      <div className={s.actions}>
        {cfg.dirty && <span className={s.dirty}>Unsaved changes</span>}
        <Button variant="outlined" size="small" onClick={cfg.downloadManifest}>
          Export Manifest
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!cfg.dirty || cfg.publishing}
          onClick={() => {
            void cfg.publish()
          }}
        >
          {cfg.publishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}
