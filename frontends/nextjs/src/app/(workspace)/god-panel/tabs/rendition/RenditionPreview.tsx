'use client'

import type { CSSProperties } from 'react'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionPreviewProps {
  cfg: RenditionConfigController
}

export function RenditionPreview({ cfg }: RenditionPreviewProps) {
  const { rendition } = cfg
  const enabledModules = rendition.modules.filter(module => module.enabled)
  const pinnedModules = enabledModules.filter(module => module.pinned)
  const enabledNav = rendition.navItems.filter(item => item.enabled)

  return (
    <section className={`${s.panel} ${s.previewPanel}`}>
      <div className={s.panelTitle}>
        <span className="material-symbols-rounded">preview</span>
        Live Control Panel Preview
      </div>
      <div className={s.preview} style={previewStyle(cfg)}>
        <div className={s.previewTop}>
          <div className={s.previewLogo}>
            {rendition.productName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>{rendition.productName}</strong>
            <span>{rendition.tagline}</span>
          </div>
        </div>
        <div className={s.previewBody}>
          <aside>
            <p>{rendition.controlPanelName}</p>
            {enabledNav.map(item => (
              <span key={item.id}>{item.label}</span>
            ))}
          </aside>
          <main>
            <div className={s.previewHero}>
              <span>{rendition.tenantId}</span>
              <strong>{pinnedModules.length} pinned modules</strong>
            </div>
            <div className={s.previewCards}>
              {enabledModules.slice(0, 4).map(module => (
                <div key={module.id}>
                  <strong>{module.label}</strong>
                  <span>{module.description}</span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}

function previewStyle(cfg: RenditionConfigController): CSSProperties {
  return {
    '--rendition-primary': cfg.rendition.primaryAccent,
    '--rendition-secondary': cfg.rendition.secondaryAccent,
    '--rendition-radius': `${cfg.rendition.borderRadius}px`,
  } as CSSProperties
}
