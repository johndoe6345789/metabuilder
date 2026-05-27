/**
 * useMainLayout — side-effects for the main app layout.
 * Restores theme + locale from DBAL on mount,
 * and syncs theme to the document element.
 */
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { updateSettings } from '@/store/slices/settingsSlice'
import { setLocale, fetchTranslations } from
  '@/store/slices/translationsSlice'
import { setTheme } from '@metabuilder/redux-slices/uiSlice'
import { fetchFromDBAL } from
  '@/store/middleware/dbalSync'
import { useUI, useResponsiveSidebar } from
  '@metabuilder/hooks'
import { supportedLocales } from '@metabuilder/translations'
import { usePathname, useRouter } from 'next/navigation'

export function useMainLayout() {
  const dispatch = useAppDispatch()
  const locale = useAppSelector(
    (state) => state.translations.locale,
  )
  const { theme, sidebarOpen, setSidebar, toggleTheme } =
    useUI()
  const { isMobile } = useResponsiveSidebar(
    sidebarOpen,
    setSidebar,
  )
  const pathname = usePathname()
  const router = useRouter()

  // Restore theme + locale from DBAL on mount
  useEffect(() => {
    fetchFromDBAL('settings', 'app').then((data) => {
      if (!data) return
      if (data.theme) dispatch(setTheme(data.theme))
      if (data.locale) {
        dispatch(setLocale(data.locale))
        dispatch(fetchTranslations(data.locale) as any)
      }
    })
  }, [dispatch])

  // Sync theme to document
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme,
    )
  }, [theme])

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    toggleTheme()
    dispatch(updateSettings({ theme: nextTheme }))
  }

  const handleCycleLocale = () => {
    const idx = supportedLocales.indexOf(locale)
    const nextLocale =
      supportedLocales[(idx + 1) % supportedLocales.length]
    dispatch(setLocale(nextLocale))
    dispatch(updateSettings({ locale: nextLocale }))
    dispatch(fetchTranslations(nextLocale) as any)
  }

  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/codegen',
      code: '/codegen/code',
      models: '/codegen/models',
      components: '/codegen/components',
      'component-trees': '/codegen/component-trees',
      workflows: '/codegen/workflows',
      lambdas: '/codegen/lambdas',
      database: '/codegen/database',
    }
    router.push(routeMap[page] || `/codegen/${page}`)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return {
    theme,
    locale,
    sidebarOpen,
    setSidebar,
    isMobile,
    handleToggleTheme,
    handleCycleLocale,
    handleNavigate,
    isActive,
  }
}
