'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Box, IconButton, Typography } from '@metabuilder/fakemui'
import { useUI, useResponsiveSidebar } from '@metabuilder/hooks'
import styles from '@metabuilder/scss/atoms/layout.module.scss'
import navData from '@/data/navigation.json'
import {
  MetabuilderWidgetProjectManager,
  MetabuilderWidgetHeaderSearch,
} from '@/lib/json-ui/json-components'
import { Toaster } from '@/components/ui/sonner'
import pkg from '../../../package.json'
import { useAppDispatch, useAppSelector } from '@/store'
import { updateSettings } from '@/store/slices/settingsSlice'
import { setLocale, fetchTranslations } from '@/store/slices/translationsSlice'
import { setTheme } from '@metabuilder/redux-slices/uiSlice'
import { fetchFromDBAL } from '@/store/middleware/dbalSync'
import { supportedLocales, localeNames } from '@metabuilder/translations'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { theme, sidebarOpen, setSidebar, toggleTheme } = useUI()
  const { isMobile } = useResponsiveSidebar(sidebarOpen, setSidebar)
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const locale = useAppSelector((state) => state.translations.locale)

  // Restore theme + locale from DBAL on mount (cross-device persistence)
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

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    toggleTheme()
    dispatch(updateSettings({ theme: nextTheme }))
  }

  const handleCycleLocale = () => {
    const idx = supportedLocales.indexOf(locale)
    const nextLocale = supportedLocales[(idx + 1) % supportedLocales.length]
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      <Box className={styles.sidebarHeader} data-testid="sidebar-header">
        <Typography variant="subtitle1" className={styles.sidebarTitle}>Navigation</Typography>
      </Box>
      <nav className={styles.sidebarContent} aria-label="Main navigation" data-testid="main-nav">
        {navData.sections.map((section) => (
          <div key={section.title} className={styles.navSection} role="group" aria-label={section.title}>
            <h3 className={styles.navSectionTitle} id={`nav-section-${section.title.toLowerCase()}`}>
              {section.title}
            </h3>
            <ul className={styles.navList} aria-labelledby={`nav-section-${section.title.toLowerCase()}`}>
              {section.items.map((item) => (
                <li key={item.href} className={styles.navItem}>
                  <Link
                    href={item.href as any}
                    className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    data-testid={`nav-link-${item.href.replace(/^\//, '') || 'home'}`}
                  >
                    <span className={`${styles.navIcon} material-symbols-outlined`} aria-hidden="true">{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  )

  return (
    <div className={styles.layout} data-testid="app-layout">
      {/* Header */}
      <Box component="header" className={styles.appBar} role="banner" data-testid="app-header">
        <Box className={styles.appBarLeft}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setSidebar(!sidebarOpen)}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            data-testid="toggle-sidebar"
          >
            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
          </IconButton>
          <Box className={styles.appBarBrand} data-testid="app-brand">
            <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--mat-sys-primary)', fontSize: 28 }}>code</span>
            <Typography variant="h6" component="h1" className={styles.appBarTitle}>
              CodeForge
            </Typography>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--mat-sys-on-surface-variant)',
                background: 'var(--mat-sys-surface-container)',
                padding: '1px 6px',
                borderRadius: '4px',
                marginLeft: '6px',
                letterSpacing: '0.3px',
                lineHeight: '16px',
                whiteSpace: 'nowrap',
              }}
              data-testid="app-version"
            >
              v{pkg.version}
            </span>
          </Box>
        </Box>
        <Box className={styles.appBarActions} data-testid="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MetabuilderWidgetProjectManager />
          <MetabuilderWidgetHeaderSearch
            onNavigate={handleNavigate}
          />
          <IconButton
            color="inherit"
            onClick={handleCycleLocale}
            aria-label={`Language: ${(localeNames as Record<string, string>)[locale] ?? locale}`}
            data-testid="toggle-language"
            title={(localeNames as Record<string, string>)[locale] ?? locale}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1 }} aria-hidden="true">
              {locale.toUpperCase()}
            </span>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            data-testid="toggle-theme"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </IconButton>
        </Box>
      </Box>

      {/* Content area */}
      <div className={styles.content} data-testid="app-content">
        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className={styles.drawerBackdrop}
            onClick={() => setSidebar(false)}
            aria-hidden="true"
            data-testid="sidebar-backdrop"
          />
        )}

        {/* Sidebar */}
        {isMobile ? (
          <aside
            id="sidebar"
            className={`${styles.drawerMobile} ${styles.sidebar} ${sidebarOpen ? styles.drawerMobileOpen : ''}`}
            aria-label="Navigation sidebar"
            aria-hidden={!sidebarOpen}
            data-testid="sidebar-mobile"
          >
            {sidebarContent}
          </aside>
        ) : (
          <aside
            id="sidebar"
            className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarHidden : ''}`}
            aria-label="Navigation sidebar"
            data-testid="sidebar"
          >
            {sidebarContent}
          </aside>
        )}

        {/* Main content */}
        <main className={styles.main} role="main" data-testid="main-content">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
