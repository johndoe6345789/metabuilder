'use client'

import { useState } from 'react'
import type { RetroSystem } from '@/hooks/useRetroSession'
import { useRetroSession } from '@/hooks/useRetroSession'
import { useKeyboardInput } from './retro-launcher/use-keyboard-input'
import { LaunchForm } from './retro-launcher/LaunchForm'
import { SessionView } from './retro-launcher/SessionView'
import s from './RetroLauncher.module.scss'

export function RetroLauncher() {
  const [system, setSystem] = useState<RetroSystem | null>(null)
  const [romUrl, setRomUrl] = useState('')
  const { session, loading, error, start, stop, sendInput } = useRetroSession()

  useKeyboardInput(session !== null, sendInput)

  const handleLaunch = async () => {
    if (system === null || romUrl.trim().length === 0) return
    await start(system, romUrl.trim())
  }

  return (
    <div className={s.root}>
      {session === null ? (
        <LaunchForm
          system={system}
          onSystemChange={setSystem}
          romUrl={romUrl}
          onRomUrlChange={setRomUrl}
          loading={loading}
          error={error}
          onLaunch={() => {
            void handleLaunch()
          }}
        />
      ) : (
        <SessionView
          session={session}
          onPress={(button, pressed) => {
            void sendInput(button, pressed)
          }}
          onStop={() => {
            void stop()
          }}
        />
      )}
    </div>
  )
}
