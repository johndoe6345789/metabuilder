'use client'

import { Button } from '@/m3'
import { RenditionModuleRow } from './RenditionModuleRow'
import type { RenditionConfigController } from './use-rendition-config'
import s from './RenditionTab.module.scss'

interface RenditionModulesPanelProps {
  cfg: RenditionConfigController
}

export function RenditionModulesPanel({ cfg }: RenditionModulesPanelProps) {
  return (
    <section className={s.panel}>
      <div className={s.sectionHead}>
        <div className={s.panelTitle}>
          <span className="material-symbols-rounded">view_module</span>
          Control Panel Modules
        </div>
        <Button variant="outlined" size="small" onClick={cfg.addModule}>
          Add Module
        </Button>
      </div>
      <div className={s.moduleList}>
        {cfg.rendition.modules.map(module => (
          <RenditionModuleRow key={module.id} cfg={cfg} module={module} />
        ))}
      </div>
    </section>
  )
}
