'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LIGHT_DEFAULTS, DARK_DEFAULTS, applyColorsToRoot,
} from './theme-defaults'
import type { ThemeColors, ThemeEditorState } from './theme-defaults'

export type { ThemeColors, ThemeEditorState }

const STORAGE_KEY = 'pg-theme-overrides'
const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
// Single-tenant local deployment for now, same default every other God Panel
// publish flow in this pass uses (ComponentTreeTab, PackagesTab).
const TENANT = 'system'

function applyStored(
  light: ThemeColors, dark: ThemeColors,
  setLightColors: (c: ThemeColors) => void,
  setDarkColors: (c: ThemeColors) => void,
): void {
  setLightColors(light)
  setDarkColors(dark)
  const isDark =
    document.documentElement.getAttribute('data-theme') === 'dark'
  applyColorsToRoot(isDark ? dark : light)
}

function loadFromLocalStorage(
  setLightColors: (c: ThemeColors) => void,
  setDarkColors: (c: ThemeColors) => void,
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored == null) return
    const parsed = JSON.parse(stored) as {
      light?: ThemeColors; dark?: ThemeColors
    }
    applyStored(
      { ...LIGHT_DEFAULTS, ...(parsed.light ?? {}) },
      { ...DARK_DEFAULTS, ...(parsed.dark ?? {}) },
      setLightColors, setDarkColors,
    )
  } catch {
    // ignore malformed storage
  }
}

export function useThemeEditor(): ThemeEditorState {
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light')
  const [lightColors, setLightColors] = useState<ThemeColors>(LIGHT_DEFAULTS)
  const [darkColors, setDarkColors] = useState<ThemeColors>(DARK_DEFAULTS)

  // DBAL (shared, tenant-wide) first, falling back to localStorage (per-
  // browser) if DBAL has nothing yet or is unreachable — same fail-safe
  // pattern WorkspacePageSlot uses for component trees.
  useEffect(() => {
    let cancelled = false
    fetch(`${DBAL}/${TENANT}/core/TenantTheme/${TENANT}`, {
      signal: AbortSignal.timeout(6000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: Record<string, unknown> } | null) => {
        if (cancelled) return
        const row = json?.data
        const rawLight = row?.lightColors
        const rawDark = row?.darkColors
        if (typeof rawLight === 'string' && typeof rawDark === 'string') {
          applyStored(
            { ...LIGHT_DEFAULTS, ...(JSON.parse(rawLight) as ThemeColors) },
            { ...DARK_DEFAULTS, ...(JSON.parse(rawDark) as ThemeColors) },
            setLightColors, setDarkColors,
          )
          return
        }
        loadFromLocalStorage(setLightColors, setDarkColors)
      })
      .catch(() => {
        if (!cancelled) loadFromLocalStorage(setLightColors, setDarkColors)
      })
    return () => {
      cancelled = true
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

      // Best-effort: a failed DBAL write still leaves the instant-apply
      // localStorage copy above intact for this browser.
      const payload = {
        id: TENANT,
        tenantId: TENANT,
        lightColors: JSON.stringify(light),
        darkColors: JSON.stringify(dark),
        updatedAt: Date.now(),
      }
      fetch(`${DBAL}/${TENANT}/core/TenantTheme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      })
        .then(res => {
          if (res.status === 409) {
            return fetch(`${DBAL}/${TENANT}/core/TenantTheme/${TENANT}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(6000),
            })
          }
          return res
        })
        .catch(() => {
          // Non-fatal — see comment above.
        })
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
