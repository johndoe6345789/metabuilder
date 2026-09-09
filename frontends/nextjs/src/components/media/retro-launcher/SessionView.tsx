'use client'

import type { RetroSession } from '@/hooks/useRetroSession'
import { VideoPlayer } from '../VideoPlayer'
import { GamepadPad } from './GamepadPad'
import s from '../RetroLauncher.module.scss'

export interface SessionViewProps {
  session: RetroSession
  /** The controller being played on, when there is one. */
  controller?: string | null
  onPress: (button: string, pressed: boolean) => void
  onStop: () => void
}

export function SessionView({
  session,
  controller,
  onPress,
  onStop,
}: SessionViewProps) {
  return (
    <>
      <VideoPlayer
        src={session.streamUrl}
        title={`${session.system.toUpperCase()} — session ${session.id.slice(0, 8)}`}
        autoPlay
      />
      {controller != null && controller !== '' && (
        <p className={s.controller}>Playing on {controller}</p>
      )}
      <GamepadPad onPress={onPress} />
      <button className={s.stopBtn} onClick={onStop}>
        Stop session
      </button>
    </>
  )
}
