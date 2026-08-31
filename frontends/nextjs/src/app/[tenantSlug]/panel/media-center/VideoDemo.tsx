'use client'

import { useState } from 'react'
import { VideoPlayer } from '@/components/media/VideoPlayer'
import { Typography } from '@/m3'
import { MediaUrlInput } from './MediaUrlInput'
import s from './page.module.scss'

const S3_URL = process.env.NEXT_PUBLIC_S3_API_URL ?? 'http://localhost:9000'

export function VideoDemo() {
  const [src, setSrc] = useState('')
  const [active, setActive] = useState('')

  return (
    <div className={s.demo}>
      <Typography variant="body2" color="text.secondary">
        Paste a video URL (S3 mp4, HLS .m3u8, or direct link) to prove playback
        works.
      </Typography>
      <MediaUrlInput
        placeholder={`${S3_URL}/media/sample.mp4`}
        value={src}
        onChange={setSrc}
        onLoad={() => {
          setActive(src.trim())
        }}
      />
      {active.length > 0 && (
        <VideoPlayer src={active} title={active.split('/').pop()} />
      )}
    </div>
  )
}
