'use client'

import { VideoPlayer } from '../../VideoPlayer'
import s from '../LiveTvSection.module.scss'

export interface NowWatchingPanelProps {
  title: string
  url: string
  onBack: () => void
}

export function NowWatchingPanel(props: NowWatchingPanelProps) {
  const { title, url, onBack } = props
  return (
    <div className={s.player}>
      <div className={s.playerHeader}>
        <div className={s.playerTitleGroup}>
          <span className={s.playerLive}>
            <span className={s.playerLiveDot} />
            LIVE
          </span>
          <h2 className={s.playerTitle}>{title}</h2>
        </div>
        <button className={s.backBtn} onClick={onBack}>
          ← Back to guide
        </button>
      </div>
      <div className={s.playerFrame}>
        <VideoPlayer src={url} title={title} />
      </div>
    </div>
  )
}
