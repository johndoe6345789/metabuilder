'use client'

import type { RetroSession } from '@/hooks/useRetroSession'
import { VideoPlayer } from '../VideoPlayer'
import { GamepadPad } from './GamepadPad'
import s from '../RetroLauncher.module.scss'

export interface SessionViewProps {
  session: RetroSession
  onPress: (button: string, pressed: boolean) => void
  onStop: () => void
}

export function SessionView({ session, onPress, onStop }: SessionViewProps) {
  return (
    <>
      <VideoPlayer
        src={session.streamUrl}
        title={`${session.system.toUpperCase()} — session ${session.id.slice(0, 8)}`}
        autoPlay
      />
      <GamepadPad onPress={onPress} />
      <button className={s.stopBtn} onClick={onStop}>
        Stop session
      </button>
    </>
  )
}
