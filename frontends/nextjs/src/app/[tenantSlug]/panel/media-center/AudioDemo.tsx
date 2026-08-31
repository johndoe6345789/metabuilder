'use client'

import { useState } from 'react'
import { AudioPlayer } from '@/components/media/AudioPlayer'
import { Typography } from '@/m3'
import { MediaUrlInput } from './MediaUrlInput'
import s from './page.module.scss'

const MEDIA_API =
  process.env.NEXT_PUBLIC_MEDIA_API_URL ?? 'http://localhost:8090'
const S3_URL = process.env.NEXT_PUBLIC_S3_API_URL ?? 'http://localhost:9000'

export function AudioDemo() {
  const [src, setSrc] = useState('')
  const [active, setActive] = useState('')

  return (
    <div className={s.demo}>
      <Typography variant="body2" color="text.secondary">
        Paste an audio URL (S3 mp3/flac, or Icecast stream{' '}
        <code>{MEDIA_API}/stream/&lt;mount&gt;</code>) to prove playback works.
      </Typography>
      <MediaUrlInput
        placeholder={`${S3_URL}/music/track.mp3`}
        value={src}
        onChange={setSrc}
        onLoad={() => {
          setActive(src.trim())
        }}
      />
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
