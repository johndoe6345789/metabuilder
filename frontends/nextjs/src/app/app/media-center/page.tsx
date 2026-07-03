'use client'

import { useState } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { VideoPlayer } from '@/components/media/VideoPlayer'
import { AudioPlayer } from '@/components/media/AudioPlayer'
import { RetroLauncher } from '@/components/media/RetroLauncher'
import { Typography, Tabs, Tab, TabPanel } from '@/m3'
import s from './page.module.scss'

const MEDIA_API =
  process.env.NEXT_PUBLIC_MEDIA_API_URL ?? 'http://localhost:8090'
const S3_URL =
  process.env.NEXT_PUBLIC_S3_API_URL ?? 'http://localhost:9000'

function VideoDemo() {
  const [src, setSrc] = useState('')
  const [active, setActive] = useState('')

  return (
    <div className={s.demo}>
      <Typography variant="body2" color="text.secondary">
        Paste a video URL (S3 mp4, HLS .m3u8, or direct link) to prove
        playback works.
      </Typography>
      <div className={s.urlRow}>
        <input
          className={s.urlInput}
          type="url"
          placeholder={`${S3_URL}/media/sample.mp4`}
          value={src}
          onChange={e => { setSrc(e.target.value) }}
        />
        <button
          className={s.loadBtn}
          onClick={() => { setActive(src.trim()) }}
          disabled={src.trim().length === 0}
        >
          Load
        </button>
      </div>
      {active.length > 0 && (
        <VideoPlayer src={active} title={active.split('/').pop()} />
      )}
    </div>
  )
}

function AudioDemo() {
  const [src, setSrc] = useState('')
  const [active, setActive] = useState('')

  return (
    <div className={s.demo}>
      <Typography variant="body2" color="text.secondary">
        Paste an audio URL (S3 mp3/flac, or Icecast stream
        {' '}<code>{MEDIA_API}/stream/&lt;mount&gt;</code>) to prove playback works.
      </Typography>
      <div className={s.urlRow}>
        <input
          className={s.urlInput}
          type="url"
          placeholder={`${S3_URL}/music/track.mp3`}
          value={src}
          onChange={e => { setSrc(e.target.value) }}
        />
        <button
          className={s.loadBtn}
          onClick={() => { setActive(src.trim()) }}
          disabled={src.trim().length === 0}
        >
          Load
        </button>
      </div>
      {active.length > 0 && (
        <AudioPlayer
          src={active}
          title={active.split('/').pop()}
          isLive={active.includes('/stream/')}
        />
      )}
    </div>
  )
}

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
        onChange={(_e, v) => { setTab(v as number) }}
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
