'use client'

import { TextField } from '@/m3'
import type { RenditionConfig } from '@/store/slices/god-slice'
import type { ChangeEvent } from 'react'
import { RenditionDesignControls } from './RenditionDesignControls'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'
import { TenantSelect } from '@/components/tenant/TenantSelect'

interface RenditionIdentityPanelProps {
  cfg: RenditionConfigController
}

export function RenditionIdentityPanel({ cfg }: RenditionIdentityPanelProps) {
  const { rendition } = cfg
  const patchText =
    (key: keyof RenditionConfig) => (event: ChangeEvent<HTMLInputElement>) => {
      cfg.patch({ [key]: event.target.value })
    }

  return (
    <section className={s.panel}>
      <div className={s.panelTitle}>
        <span className="material-symbols-rounded">tune</span>
        Identity
      </div>
      <div className={s.formGrid}>
        <TenantSelect
          id="rendition-tenant"
          label="Tenant ID"
          value={rendition.tenantId}
          onChange={tenantId => {
            cfg.patch({ tenantId })
          }}
        />
        <TextField
          size="small"
          label="Product name"
          value={rendition.productName}
          onChange={patchText('productName')}
        />
        <TextField
          size="small"
          label="Control panel name"
          value={rendition.controlPanelName}
          onChange={patchText('controlPanelName')}
        />
        <TextField
          size="small"
          label="Default landing path"
          value={rendition.defaultLandingPath}
          onChange={patchText('defaultLandingPath')}
        />
      </div>
      <TextField
        size="small"
        fullWidth
        label="Tagline"
        value={rendition.tagline}
        onChange={patchText('tagline')}
      />
      <RenditionDesignControls cfg={cfg} />
    </section>
  )
}
