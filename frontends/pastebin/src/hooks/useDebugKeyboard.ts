import { useEffect } from 'react'
import type { useDebugger } from './useDebugger'

type Debugger = ReturnType<typeof useDebugger>

/**
 * PyCharm-style debug keys while a session is live: F9 resume, F8 step over,
 * ⇧F8 step out, F7 step into, ⇧F5 stop.
 */
export function useDebugKeyboard(
  dbg: Debugger,
  isActive: boolean,
  isPaused: boolean,
) {
  useEffect(() => {
    if (!isActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F5' && e.shiftKey) {
        e.preventDefault()
        void dbg.stopDebugging()
        return
      }
      if (!isPaused) return
      switch (e.key) {
        case 'F9':
          e.preventDefault()
          void dbg.resume()
          break
        case 'F8':
          e.preventDefault()
          if (e.shiftKey) void dbg.stepOut()
          else void dbg.stepOver()
          break
        case 'F7':
          e.preventDefault()
          void dbg.stepIn()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, isPaused, dbg])
}
