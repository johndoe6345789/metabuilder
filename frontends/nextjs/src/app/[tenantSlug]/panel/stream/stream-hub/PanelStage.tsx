'use client'

import { LiveTvSection } from '@/components/media/stream/LiveTvSection'
import { RadioSection } from '@/components/media/stream/RadioSection'
import { RetroLauncher } from '@/components/media/RetroLauncher'
import type { SectionId } from './sections'
import s from '../page.module.scss'

export interface PanelStageProps {
  active: SectionId
  watchTrigger: { channelId: string; nonce: number } | null
}

export function PanelStage({ active, watchTrigger }: PanelStageProps) {
  return (
    <div className={s.panelStage}>
      <div key={active} className={s.panel}>
        {active === 'tv' && (
          <LiveTvSection externalWatchTrigger={watchTrigger} />
        )}
        {active === 'radio' && <RadioSection />}
        {active === 'retro' && (
          <div className={s.retroShell}>
            <RetroLauncher />
          </div>
        )}
      </div>
    </div>
  )
}
