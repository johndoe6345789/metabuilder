import { tenantGodPanelPath, tenantPath } from '@/lib/tenant/workspace-paths'

export interface LevelNavItem {
  label: string
  level: number
  path: string
}

/** Level navigation mapping (mirrors Qt6 App.qml Repeater model). */
export const LEVEL_NAV_ITEMS: LevelNavItem[] = [
  { label: 'Public', level: 1, path: '/' },
  { label: 'User', level: 1, path: '/dashboard' },
  { label: 'Admin', level: 2, path: '/admin' },
  { label: 'God', level: 4, path: '/god-panel' },
  { label: 'Super God', level: 5, path: '/super-god-panel' },
]

export function isActivePath(pathname: string, path: string): boolean {
  return path === '/'
    ? pathname === '/'
    : pathname === path || pathname.startsWith(path + '/')
}

/** Public stays at the site root; the rest are tenant-scoped once
 *  signed in, and only shown up to the caller's own level. */
export function visibleLevelNavItems(
  tenantId: string,
  isAuthenticated: boolean,
  userLevel: number
): LevelNavItem[] {
  const items = LEVEL_NAV_ITEMS.map(item => {
    if (item.path === '/god-panel') {
      return { ...item, path: tenantGodPanelPath(tenantId) }
    }
    if (item.path === '/' || !isAuthenticated) return item
    return { ...item, path: tenantPath(tenantId, item.path) }
  })
  return items.filter(item =>
    isAuthenticated ? item.level <= userLevel : item.level <= 1
  )
}
