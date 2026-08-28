'use client'

import { useState, useEffect, useCallback } from 'react'
import type { RetroSystem } from '@/hooks/useRetroSession'
import { useRetroSession } from '@/hooks/useRetroSession'
import { SystemPicker } from './SystemPicker'
import { VideoPlayer } from './VideoPlayer'
import s from './RetroLauncher.module.scss'

const BUTTONS = [
  'up',
  'down',
  'left',
  'right',
  'a',
  'b',
  'x',
  'y',
  'start',
  'select',
  'l',
  'r',
]

const KEY_MAP: Record<string, string> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  z: 'a',
  x: 'b',
  a: 'x',
  s: 'y',
  Enter: 'start',
  Shift: 'select',
  q: 'l',
  w: 'r',
}

export function RetroLauncher() {
  const [system, setSystem] = useState<RetroSystem | null>(null)
  const [romUrl, setRomUrl] = useState('')
  const { session, loading, error, start, stop, sendInput } = useRetroSession()

  const handleLaunch = async () => {
    if (system === null || romUrl.trim().length === 0) return
    await start(system, romUrl.trim())
  }

  const handleKey = useCallback(
    (e: KeyboardEvent, pressed: boolean) => {
      const btn = KEY_MAP[e.key]
      if (btn === undefined) return
      e.preventDefault()
      void sendInput(btn, pressed)
    },
    [sendInput]
  )

  useEffect(() => {
    if (session === null) return undefined
    const down = (e: KeyboardEvent) => {
      handleKey(e, true)
    }
    const up = (e: KeyboardEvent) => {
      handleKey(e, false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [session, handleKey])

  return (
    <div className={s.root}>
      {session === null ? (
        <>
          <p className={s.label}>Select system</p>
          <SystemPicker value={system} onChange={setSystem} />

          <label className={s.romLabel}>
            ROM URL (from S3 or any URL)
            <input
              className={s.romInput}
              type="url"
              placeholder="http://localhost:9000/games/mario.nes"
              value={romUrl}
              onChange={e => {
                setRomUrl(e.target.value)
              }}
            />
          </label>

          {error !== null && <p className={s.error}>{error}</p>}

          <button
            className={s.launch}
            disabled={system === null || romUrl.trim().length === 0 || loading}
            onClick={() => {
              void handleLaunch()
            }}
          >
            {loading
              ? 'Launching…'
              : `Launch ${system?.toUpperCase() ?? ''} game`}
          </button>
          <p className={s.keyHint}>
            Keyboard: Arrows=D-Pad · Z=A · X=B · Enter=Start · Shift=Select
          </p>
        </>
      ) : (
        <>
          <VideoPlayer
            src={session.streamUrl}
            title={`${session.system.toUpperCase()} — session ${session.id.slice(0, 8)}`}
            autoPlay
          />
          <div className={s.pad}>
            {BUTTONS.map(btn => (
              <button
                key={btn}
                className={s.padBtn}
                onPointerDown={() => {
                  void sendInput(btn, true)
                }}
                onPointerUp={() => {
                  void sendInput(btn, false)
                }}
              >
                {btn}
              </button>
            ))}
          </div>
          <button
            className={s.stopBtn}
            onClick={() => {
              void stop()
            }}
          >
            Stop session
          </button>
        </>
      )}
    </div>
  )
}
