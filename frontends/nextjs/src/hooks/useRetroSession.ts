'use client'

import { useState, useCallback } from 'react'
import type { RetroSession, RetroSessionState, RetroSystem } from './retro-session-types'

export type { RetroSession, RetroSystem } from './retro-session-types'

const MEDIA_API =
  process.env.NEXT_PUBLIC_MEDIA_API_URL ?? 'http://localhost:8090'

export function useRetroSession() {
  const [state, setState] = useState<RetroSessionState>({
    session: null,
    loading: false,
    error: null,
  })

  const start = useCallback(
    async (system: RetroSystem, romPath: string): Promise<void> => {
      setState({ session: null, loading: true, error: null })
      try {
        const res = await fetch(`${MEDIA_API}/api/retro/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system, rom_path: romPath }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as RetroSession
        setState({ session: data, loading: false, error: null })
      } catch (e) {
        setState({
          session: null,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to start session',
        })
      }
    },
    []
  )

  const stop = useCallback(async (): Promise<void> => {
    const id = state.session?.id
    if (id === undefined) return
    setState(prev => ({ ...prev, loading: true }))
    try {
      await fetch(`${MEDIA_API}/api/retro/sessions/${id}`, {
        method: 'DELETE',
      })
    } catch {
      // Both callers fire this with `void stop()` -- the session is
      // dropped client-side either way, so a network failure here isn't
      // worth surfacing, only swallowing quietly.
    } finally {
      setState({ session: null, loading: false, error: null })
    }
  }, [state.session?.id])

  const sendInput = useCallback(
    async (button: string, pressed: boolean): Promise<void> => {
      const id = state.session?.id
      if (id === undefined) return
      try {
        await fetch(`${MEDIA_API}/api/retro/sessions/${id}/input`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ button, pressed }),
        })
      } catch {
        // Called as `void sendInput(...)` on every keypress -- a dropped
        // input is invisible in-game, not worth an unhandled rejection.
      }
    },
    [state.session?.id]
  )

  return { ...state, start, stop, sendInput }
}
