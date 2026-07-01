'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ScriptEntry } from './ide-types'

const DEFAULT_CODE = '-- Lua script\nlog("Hello from Lua!")\n'
const STORAGE_KEY = 'lua-scripts'

function loadScripts(): ScriptEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw != null) return JSON.parse(raw) as ScriptEntry[]
  } catch { /* ignore */ }
  return []
}

export function saveScripts(scripts: ScriptEntry[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts))
  }
}

export function useLuaScripts() {
  const [scripts, setScripts] = useState<ScriptEntry[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const loaded = loadScripts()
    setScripts(loaded)
    const first = loaded[0]
    if (first != null) setSelectedId(first.id)
  }, [])

  const addScript = useCallback(() => {
    const entry: ScriptEntry = {
      id: `lua_${Date.now()}`,
      name: 'new_script.lua',
      code: DEFAULT_CODE,
    }
    setScripts((prev) => {
      const next = [...prev, entry]
      saveScripts(next)
      return next
    })
    setSelectedId(entry.id)
  }, [])

  const updateName = useCallback(
    (name: string, id: string | null) => {
      if (id == null) return
      setScripts((prev) =>
        prev.map((sc) => (sc.id === id ? { ...sc, name } : sc))
      )
    },
    []
  )

  const selected = scripts.find((sc) => sc.id === selectedId) ?? null

  return {
    scripts,
    selectedId,
    selected,
    setSelectedId,
    addScript,
    updateName,
    save: () => { saveScripts(scripts) },
  }
}
