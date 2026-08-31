'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { AppsRow } from '@/components/media/stream/AppsRow'
import { Hero } from './stream-hub/Hero'
import { SectionNav } from './stream-hub/SectionNav'
import { PanelStage } from './stream-hub/PanelStage'
import { useStreamHub } from './stream-hub/use-stream-hub'
import s from './page.module.scss'

function StreamHubContent() {
  const { active, setActive, watchTrigger, handleHeroWatch } = useStreamHub()

  return (
    <div className={s.root}>
      <Hero onWatch={handleHeroWatch} />
      <AppsRow />
      <SectionNav active={active} onSelect={setActive} />
      <PanelStage active={active} watchTrigger={watchTrigger} />
    </div>
  )
}

export default function StreamHubPage() {
  return (
    <LevelGate minLevel={2} levelName="User">
      <StreamHubContent />
    </LevelGate>
  )
}
