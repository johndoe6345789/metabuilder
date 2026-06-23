'use client'

import { useState, useCallback, useEffect } from 'react'
import { loadToken, saveToken, removeToken } from '../queryUtils'
import cfg from '../data/queryConsole.json'

const { defaultToken } = cfg

interface UseAuthReturn {
  token: string
  authed: boolean
  tokenInput: string
  setTokenInput: (v: string) => void
  handleLogin: () => void
  handleLogout: () => void
  handleTurboLogin: () => Promise<void>
  turboError: string | null
  clearTurboError: () => void
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [turboError, setTurboError] = useState<string | null>(null)

  useEffect(() => {
    const saved = loadToken()
    if (saved) {
      setToken(saved)
      setAuthed(true)
    }
  }, [])

  const loginWithToken = useCallback((tok: string) => {
    const t = tok.trim() || defaultToken
    setToken(t)
    saveToken(t)
    setAuthed(true)
  }, [])

  const handleLogin = useCallback(() => {
    loginWithToken(tokenInput)
  }, [tokenInput, loginWithToken])

  const handleLogout = useCallback(() => {
    setToken('')
    setAuthed(false)
    removeToken()
  }, [])

  const handleTurboLogin = useCallback(async () => {
    try {
      const raw = await navigator.clipboard.readText()
      if (!raw.trim()) {
        setTurboError('Clipboard is empty. Copy a Turbologin from Vault first.')
        return
      }
      let data: Record<string, unknown>
      try { data = JSON.parse(raw) } catch {
        setTurboError('Clipboard does not contain valid Turbologin JSON.')
        return
      }
      if (!data.pass) {
        setTurboError('Clipboard JSON is missing required field (pass).')
        return
      }
      loginWithToken(data.pass as string)
    } catch {
      setTurboError(
        'Could not read clipboard. Please allow clipboard access and try again.'
      )
    }
  }, [loginWithToken])

  return {
    token,
    authed,
    tokenInput,
    setTokenInput,
    handleLogin,
    handleLogout,
    handleTurboLogin,
    turboError,
    clearTurboError: () => setTurboError(null),
  }
}
