import { useState, useEffect } from 'react'

export interface ThemeConfig {
  sidebar?: {
    width?: string
    widthMobile?: string
    widthIcon?: string
    backgroundColor?: string
    foregroundColor?: string
    borderColor?: string
    accentColor?: string
    accentForeground?: string
    hoverBackground?: string
    activeBackground?: string
    headerHeight?: string
    transitionDuration?: string
    zIndex?: number
  }
  colors?: Record<string, string>
  spacing?: {
    radius?: string
  }
  typography?: {
    fontFamily?: {
      body?: string
      heading?: string
      code?: string
    }
  }
}

const DEFAULT_THEME: ThemeConfig = {
  sidebar: {
    width: '16rem',
    widthMobile: '18rem',
    widthIcon: '3rem',
    backgroundColor: 'oklch(0.19 0.02 265)',
    foregroundColor: 'oklch(0.95 0.01 265)',
    borderColor: 'oklch(0.28 0.03 265)',
    accentColor: 'oklch(0.58 0.24 265)',
    accentForeground: 'oklch(1 0 0)',
    hoverBackground: 'oklch(0.25 0.03 265)',
    activeBackground: 'oklch(0.30 0.04 265)',
    headerHeight: '4rem',
    transitionDuration: '200ms',
    zIndex: 40,
  },
  colors: {},
  spacing: {
    radius: '0.5rem',
  },
  typography: {
    fontFamily: {
      body: "'IBM Plex Sans', sans-serif",
      heading: "'JetBrains Mono', monospace",
      code: "'JetBrains Mono', monospace",
    },
  },
}

export function useThemeConfig() {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(DEFAULT_THEME)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTheme() {
      try {
        const response = await fetch('/theme.json')
        if (response.ok) {
          const config = await response.json()
          setThemeConfig({ ...DEFAULT_THEME, ...config })
        } else {
          console.warn('Failed to load theme.json, using defaults')
          setThemeConfig(DEFAULT_THEME)
        }
      } catch (error) {
        console.error('Error loading theme config:', error)
        setThemeConfig(DEFAULT_THEME)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  useEffect(() => {
    if (themeConfig.sidebar && !isLoading) {
      const root = document.documentElement
      const sidebar = themeConfig.sidebar

      if (sidebar.width) root.style.setProperty('--sidebar-width', sidebar.width)
      if (sidebar.widthMobile) root.style.setProperty('--sidebar-width-mobile', sidebar.widthMobile)
      if (sidebar.widthIcon) root.style.setProperty('--sidebar-width-icon', sidebar.widthIcon)
      if (sidebar.backgroundColor) root.style.setProperty('--sidebar-bg', sidebar.backgroundColor)
      if (sidebar.foregroundColor) root.style.setProperty('--sidebar-fg', sidebar.foregroundColor)
      if (sidebar.borderColor) root.style.setProperty('--sidebar-border', sidebar.borderColor)
      if (sidebar.accentColor) root.style.setProperty('--sidebar-accent', sidebar.accentColor)
      if (sidebar.accentForeground) root.style.setProperty('--sidebar-accent-fg', sidebar.accentForeground)
      if (sidebar.hoverBackground) root.style.setProperty('--sidebar-hover-bg', sidebar.hoverBackground)
      if (sidebar.activeBackground) root.style.setProperty('--sidebar-active-bg', sidebar.activeBackground)
      if (sidebar.headerHeight) root.style.setProperty('--sidebar-header-height', sidebar.headerHeight)
      if (sidebar.transitionDuration) root.style.setProperty('--sidebar-transition', sidebar.transitionDuration)
      if (sidebar.zIndex !== undefined) root.style.setProperty('--sidebar-z-index', sidebar.zIndex.toString())
    }
  }, [themeConfig, isLoading])

  return { themeConfig, isLoading }
}
