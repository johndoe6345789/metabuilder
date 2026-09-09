'use client'

import { isSafeMediaSrc } from './mediaUrl'
import { useAudioElement } from './audio-player/use-audio-element'
import { useLiveAudio } from './player/use-live-audio'
import { TrackArtwork } from './audio-player/TrackArtwork'
import { TrackInfo } from './audio-player/TrackInfo'
import { PlaybackControls } from './audio-player/PlaybackControls'
import s from './AudioPlayer.module.scss'

export interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  artwork?: string
  isLive?: boolean
}

export function AudioPlayer({
  src,
  title,
  artist,
  artwork,
  isLive,
}: AudioPlayerProps) {
  const {
    audioRef,
    playing,
    setPlaying,
    current,
    setCurrent,
    duration,
    setDuration,
    vol,
    toggle,
    seek,
    changeVol,
  } = useAudioElement()

  const safe = isSafeMediaSrc(src) ? src : ''
  // A live stream is an open connection: any blip ends it, and nothing
  // used to notice -- the play button simply went back to paused.
  const { error } = useLiveAudio(audioRef, safe, isLive === true)

  return (
    <div className={s.root}>
      <audio
        ref={audioRef}
        src={safe === '' ? undefined : safe}
        onPlay={() => {
          setPlaying(true)
        }}
        onPause={() => {
          setPlaying(false)
        }}
        onTimeUpdate={() => {
          setCurrent(audioRef.current?.currentTime ?? 0)
        }}
        onDurationChange={() => {
          setDuration(audioRef.current?.duration ?? 0)
        }}
      />

      {error !== null && (
        <div className={s.error} role="alert">
          {error}
        </div>
      )}

      <TrackArtwork artwork={artwork} title={title} />
      <TrackInfo title={title} artist={artist} isLive={isLive} />
      <PlaybackControls
        playing={playing}
        onToggle={toggle}
        isLive={isLive}
        current={current}
        duration={duration}
        onSeek={seek}
        vol={vol}
        onVolChange={changeVol}
      />
    </div>
  )
}
