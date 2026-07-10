'use client'

import { Button } from '@/m3'
import { RenditionNavRow } from './RenditionNavRow'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionNavigationPanelProps {
  cfg: RenditionConfigController
}

export function RenditionNavigationPanel({
  cfg,
}: RenditionNavigationPanelProps) {
  return (
    <section className={s.panel}>
      <div className={s.sectionHead}>
        <div className={s.panelTitle}>
          <span className="material-symbols-rounded">menu_open</span>
          Navigation
        </div>
        <Button variant="outlined" size="small" onClick={cfg.addNavItem}>
          Add Link
        </Button>
      </div>
      <div className={s.navList}>
        {cfg.rendition.navItems.map(item => (
          <RenditionNavRow key={item.id} cfg={cfg} item={item} />
        ))}
      </div>
    </section>
  )
}
