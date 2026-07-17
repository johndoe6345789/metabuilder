'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LIGHT_DEFAULTS, DARK_DEFAULTS, applyColorsToRoot,
} from './theme-defaults'
import type { ThemeColors, ThemeEditorState } from './theme-defaults'

export type { ThemeColors, ThemeEditorState }

const STORAGE_KEY = 'pg-theme-overrides'

export function useThemeEditor(): ThemeEditorState {
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light')
  const [lightColors, setLightColors] = useState<ThemeColors>(LIGHT_DEFAULTS)
  const [darkColors, setDarkColors] = useState<ThemeColors>(DARK_DEFAULTS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored == null) return
      const parsed = JSON.parse(stored) as {
        light?: ThemeColors; dark?: ThemeColors
      }
      const light = { ...LIGHT_DEFAULTS, ...(parsed.light ?? {}) }
      const dark = { ...DARK_DEFAULTS, ...(parsed.dark ?? {}) }
      setLightColors(light)
      setDarkColors(dark)
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark'
      applyColorsToRoot(isDark ? dark : light)
    } catch {
      // ignore malformed storage
    }
  }, [])

  const applyColors = useCallback((colors: ThemeColors) => {
    applyColorsToRoot(colors)
  }, [])

  const resetColors = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    const root = document.documentElement
    Object.keys({ ...LIGHT_DEFAULTS, ...DARK_DEFAULTS }).forEach(k => {
      root.style.removeProperty(k)
    })
    setLightColors(LIGHT_DEFAULTS)
    setDarkColors(DARK_DEFAULTS)
  }, [])

  const saveColors = useCallback(
    (light: ThemeColors, dark: ThemeColors) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ light, dark }))
    },
    [],
  )

  const updateColor = useCallback(
    (tab: 'light' | 'dark', key: string, val: string) => {
      if (tab === 'light') {
        setLightColors(prev => ({ ...prev, [key]: val }))
      } else {
        setDarkColors(prev => ({ ...prev, [key]: val }))
      }
    },
    [],
  )

  return {
    lightColors, darkColors, activeTab, setActiveTab,
    updateColor, applyColors, resetColors, saveColors,
    lightDefaults: LIGHT_DEFAULTS,
    darkDefaults: DARK_DEFAULTS,
  }
}
