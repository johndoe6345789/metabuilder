'use client'

import Link from 'next/link'
import { Box, IconButton, Typography } from
  '@metabuilder/fakemui'
import styles from '@metabuilder/scss/atoms/layout.module.scss'
import navData from '@/data/navigation.json'
import {
  MetabuilderWidgetProjectManager,
  MetabuilderWidgetHeaderSearch,
} from '@/lib/json-ui/json-components'
import { Toaster } from '@/components/ui/sonner'
import pkg from '../../../package.json'
import { localeNames } from '@metabuilder/translations'
import { useMainLayout } from './hooks/useMainLayout'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    theme,
    locale,
    sidebarOpen,
    setSidebar,
    isMobile,
    handleToggleTheme,
    handleCycleLocale,
    handleNavigate,
    isActive,
  } = useMainLayout()

  const sidebarContent = (
    <>
      <Box
        className={styles.sidebarHeader}
        data-testid="sidebar-header"
      >
        <Typography
          variant="subtitle1"
          className={styles.sidebarTitle}
        >
          Navigation
        </Typography>
      </Box>
      <nav
        className={styles.sidebarContent}
        aria-label="Main navigation"
        data-testid="main-nav"
      >
        {navData.sections.map((section) => (
          <div
            key={section.title}
            className={styles.navSection}
            role="group"
            aria-label={section.title}
          >
            <h3
              className={styles.navSectionTitle}
              id={`nav-section-${section.title.toLowerCase()}`}
            >
              {section.title}
            </h3>
            <ul
              className={styles.navList}
              aria-labelledby={
                `nav-section-${section.title.toLowerCase()}`
              }
            >
              {section.items.map((item) => (
                <li
                  key={item.href}
                  className={styles.navItem}
                >
                  <Link
                    href={item.href as any}
                    className={
                      `${styles.navLink} ` +
                      `${isActive(item.href) ? styles.navLinkActive : ''}`
                    }
                    aria-current={
                      isActive(item.href)
                        ? 'page'
                        : undefined
                    }
                    data-testid={
                      `nav-link-${item.href.replace(/^\//, '') || 'home'}`
                    }
                  >
                    <span
                      className={
                        `${styles.navIcon} material-symbols-outlined`
                      }
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span className={styles.navLabel}>
                      {item.label}
                    </span>
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
    <div
      className={styles.layout}
      data-testid="app-layout"
    >
      <Box
        component="header"
        className={styles.appBar}
        role="banner"
        data-testid="app-header"
      >
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
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              menu
            </span>
          </IconButton>
          <Box
            className={styles.appBarBrand}
            data-testid="app-brand"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                color: 'var(--mat-sys-primary)',
                fontSize: 28,
              }}
            >
              code
            </span>
            <Typography
              variant="h6"
              component="h1"
              className={styles.appBarTitle}
            >
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
        <Box
          className={styles.appBarActions}
          data-testid="header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <MetabuilderWidgetProjectManager />
          <MetabuilderWidgetHeaderSearch
            onNavigate={handleNavigate}
          />
          <IconButton
            color="inherit"
            onClick={handleCycleLocale}
            aria-label={
              `Language: ` +
              `${(localeNames as Record<string, string>)[locale] ?? locale}`
            }
            data-testid="toggle-language"
            title={
              (localeNames as Record<string, string>)[locale] ??
              locale
            }
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              {locale.toUpperCase()}
            </span>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleToggleTheme}
            aria-label={
              `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`
            }
            data-testid="toggle-theme"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </IconButton>
        </Box>
      </Box>

      <div
        className={styles.content}
        data-testid="app-content"
      >
        {isMobile && sidebarOpen && (
          <div
            className={styles.drawerBackdrop}
            onClick={() => setSidebar(false)}
            aria-hidden="true"
            data-testid="sidebar-backdrop"
          />
        )}

        {isMobile ? (
          <aside
            id="sidebar"
            className={
              `${styles.drawerMobile} ${styles.sidebar} ` +
              `${sidebarOpen ? styles.drawerMobileOpen : ''}`
            }
            aria-label="Navigation sidebar"
            aria-hidden={!sidebarOpen}
            data-testid="sidebar-mobile"
          >
            {sidebarContent}
          </aside>
        ) : (
          <aside
            id="sidebar"
            className={
              `${styles.sidebar} ` +
              `${!sidebarOpen ? styles.sidebarHidden : ''}`
            }
            aria-label="Navigation sidebar"
            data-testid="sidebar"
          >
            {sidebarContent}
          </aside>
        )}

        <main
          className={styles.main}
          role="main"
          data-testid="main-content"
        >
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
