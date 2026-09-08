'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LIGHT_DEFAULTS,
  DARK_DEFAULTS,
  applyColorsToRoot,
} from './theme-defaults'
import type {
  SaveStatus,
  ThemeColors,
  ThemeEditorState,
} from './theme-defaults'
import { resolveTenantTheme, applyTenantTheme } from './apply-tenant-theme'

export type { ThemeColors, ThemeEditorState }

const STORAGE_KEY = 'pg-theme-overrides'
const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/**
 * The Theme tab, editing one tenant's brand colours.
 *
 * `tenant` used to be the constant 'system'. A founder's colours were
 * saved into a tenant they do not own, and the app reads a visitor's
 * theme from the tenant whose site they are on -- so what the founder set
 * here was never what anyone saw on their published pages.
 */
export function useThemeEditor(tenant: string): ThemeEditorState {
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light')
  const [lightColors, setLightColors] = useState<ThemeColors>(LIGHT_DEFAULTS)
  const [darkColors, setDarkColors] = useState<ThemeColors>(DARK_DEFAULTS)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  // Same resolution Providers uses app-wide (DBAL, falling back to
  // localStorage) -- this additionally syncs the editor's own light/dark
  // state so the swatches reflect what's actually applied, not just the
  // built-in defaults.
  useEffect(() => {
    let cancelled = false
    resolveTenantTheme(tenant)
      .then(theme => {
        if (cancelled) return
        setLightColors(theme.light)
        setDarkColors(theme.dark)
        const isDark =
          document.documentElement.getAttribute('data-theme') === 'dark'
        applyTenantTheme(theme, isDark ? 'dark' : 'light')
      })
      .catch(() => {
        // resolveTenantTheme already falls back internally; nothing left to do
      })
    return () => {
      cancelled = true
    }
  }, [tenant])

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
    async (light: ThemeColors, dark: ThemeColors) => {
      // localStorage first, so this browser keeps the colours even when
      // the write below fails. It is not a substitute for the write:
      // visitors read the TenantTheme row, never this browser's storage,
      // so a refused write used to be swallowed as "non-fatal" while the
      // founder saw their colours and nobody else did.
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ light, dark }))
      setSaveStatus('saving')
      setSaveError(null)

      const payload = {
        id: tenant,
        tenantId: tenant,
        lightColors: JSON.stringify(light),
        darkColors: JSON.stringify(dark),
        updatedAt: Date.now(),
      }
      const send = (url: string, method: 'POST' | 'PUT') =>
        fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(6000),
        })
      const base = `${DBAL}/${tenant}/core/TenantTheme`
      try {
        let res = await send(base, 'POST')
        // A 409 means the row is already there; the save must update it.
        if (res.status === 409) res = await send(`${base}/${tenant}`, 'PUT')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setSaveStatus('saved')
      } catch (e: unknown) {
        setSaveStatus('failed')
        setSaveError(e instanceof Error ? e.message : 'the data layer refused')
      }
    },
    [tenant]
  )

  const updateColor = useCallback(
    (tab: 'light' | 'dark', key: string, val: string) => {
      if (tab === 'light') {
        setLightColors(prev => ({ ...prev, [key]: val }))
      } else {
        setDarkColors(prev => ({ ...prev, [key]: val }))
      }
    },
    []
  )

  return {
    lightColors,
    darkColors,
    activeTab,
    setActiveTab,
    updateColor,
    applyColors,
    resetColors,
    saveColors,
    saveStatus,
    saveError,
    lightDefaults: LIGHT_DEFAULTS,
    darkDefaults: DARK_DEFAULTS,
  }
}
