'use client'

import { useState } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { RetroLauncher } from '@/components/media/RetroLauncher'
import { Typography, Tabs, Tab, TabPanel } from '@/m3'
import { VideoDemo } from './VideoDemo'
import { AudioDemo } from './AudioDemo'
import s from './page.module.scss'

function MediaCenterContent() {
  const [tab, setTab] = useState(0)

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Typography variant="h4">Media Centre</Typography>
        <Typography variant="body2" color="text.secondary">
          Video playback · Audio streaming · Retro gaming via libretro
        </Typography>
      </div>
      <Tabs
        value={tab}
        onChange={(_e, v) => {
          setTab(v as number)
        }}
        className={s.tabs}
      >
        <Tab label="Video" />
        <Tab label="Audio" />
        <Tab label="Retro Gaming" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <VideoDemo />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <AudioDemo />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <RetroLauncher />
      </TabPanel>
    </div>
  )
}

export default function MediaCenterPage() {
  return (
    <LevelGate minLevel={2} levelName="User">
      <MediaCenterContent />
    </LevelGate>
  )
}
