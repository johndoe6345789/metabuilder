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
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  useEffect(() => {
    const saved = loadToken()
    if (saved) {
      setToken(saved)
      setAuthed(true)
    }
  }, [])

  const handleLogin = useCallback(() => {
    const t = tokenInput.trim() || defaultToken
    setToken(t)
    saveToken(t)
    setAuthed(true)
  }, [tokenInput])

  const handleLogout = useCallback(() => {
    setToken('')
    setAuthed(false)
    removeToken()
  }, [])

  return {
    token,
    authed,
    tokenInput,
    setTokenInput,
    handleLogin,
    handleLogout,
  }
}
