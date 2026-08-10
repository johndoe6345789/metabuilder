'use client'

import { useState } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { Typography, Tabs, Tab, TabPanel } from '@/m3'
import { LiveTvSection } from '@/components/media/stream/LiveTvSection'
import { RadioSection } from '@/components/media/stream/RadioSection'
import { RetroLauncher } from '@/components/media/RetroLauncher'
import s from './page.module.scss'

function StreamHubContent() {
  const [tab, setTab] = useState(0)

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Typography variant="h4">MetaBuilder Stream</Typography>
        <Typography variant="body2" color="text.secondary">
          Live TV with a real guide, radio, and retro gaming — the one thing a
          real streaming box can&apos;t do — all running on your own stack.
        </Typography>
      </div>

      <Tabs
        value={tab}
        onChange={(_e, v) => { setTab(v as number) }}
        className={s.tabs}
      >
        <Tab label="Live TV" />
        <Tab label="Radio" />
        <Tab label="Retro Games" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <LiveTvSection />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <RadioSection />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <RetroLauncher />
      </TabPanel>
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
