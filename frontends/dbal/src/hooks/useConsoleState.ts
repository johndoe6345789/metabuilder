'use client'

import { useRef, useCallback, useState } from 'react'
import type { HttpMethod, QueryHistoryEntry } from '../types'
import { useAuth } from './useAuth'
import { useQueryHistory } from './useQueryHistory'
import { useGuiQuery } from './useGuiQuery'
import { useQueryExecutor } from './useQueryExecutor'

export function useConsoleState() {
  const [mode, setMode] = useState<'gui' | 'cli'>('cli')
  const [cliInput, setCliInput] = useState('')
  const cliRef = useRef<HTMLInputElement | null>(null)
  const auth = useAuth()
  const hist = useQueryHistory()
  const gui = useGuiQuery()
  const exec = useQueryExecutor(auth.token)

  const focusCli = useCallback(() => {
    setMode('cli')
    setTimeout(() => cliRef.current?.focus(), 50)
  }, [])

  const handleHistorySelect = useCallback(
    (entry: QueryHistoryEntry) => {
      hist.restoreFrom(
        entry,
        cmd => { setMode('cli'); setCliInput(cmd) },
        (m: HttpMethod, t, p, e, id) => {
          setMode('gui'); gui.setGuiFromParts(m, t, p, e, id)
        },
      )
    },
    [hist, gui],
  )
  const handleExecuteGui = useCallback(async () => {
    const parsed = gui.parseBody()
    if (parsed.ok) {
      await exec.executeQuery(
        gui.method, gui.buildPath(), parsed.value, hist.pushEntry,
      )
    }
  }, [gui, exec, hist])
  const handleExecuteCli = useCallback(async () => {
    await exec.executeCli(cliInput, auth.token, hist.pushEntry)
  }, [exec, cliInput, auth.token, hist])

  return {
    mode, setMode, cliInput, setCliInput, cliRef,
    auth, hist, gui, exec,
    focusCli,
    handleHistorySelect,
    handleExecuteGui,
    handleExecuteCli,
  }
}
