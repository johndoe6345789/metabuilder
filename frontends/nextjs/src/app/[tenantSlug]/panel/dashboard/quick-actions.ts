/** The dashboard's shortcut tiles, filtered to what the viewer may open. */

import {
  tenantGodPanelPath,
  tenantPath,
} from '@/lib/tenant/workspace-paths'

export interface QuickAction {
  href: string
  icon: string
  title: string
  desc: string
  minLevel: number
}

/**
 * Every tile the product has, in tier order. Declared once here rather
 * than inline in the view, so the level rule can be tested without
 * rendering anything.
 *
 * Every href is built from the tenant, not just the God Panel's. Four of
 * the five were plain workspace paths -- '/profile', '/comments',
 * '/admin', '/super-god-panel' -- and under basePath '/app' those resolve
 * to /app/profile, which Next matches as tenantSlug "profile", finds no
 * such tenant, and 404s. Three of the four tiles on a founder's very first
 * screen were dead. The sidebar has always done this correctly; only the
 * one tile that was handed a ready-made path here worked.
 */
export function allQuickActions(
  tenant: string | null | undefined
): QuickAction[] {
  return [
    {
      href: tenantPath(tenant, '/profile'),
      icon: '👤',
      title: 'Profile',
      desc: 'Edit your profile information',
      minLevel: 1,
    },
    {
      href: tenantPath(tenant, '/comments'),
      icon: '💬',
      title: 'Comments',
      desc: 'View community discussion',
      minLevel: 1,
    },
    {
      href: tenantPath(tenant, '/admin'),
      icon: '🛡️',
      title: 'Admin Panel',
      desc: 'Manage users and data',
      minLevel: 3,
    },
    {
      href: tenantGodPanelPath(tenant),
      icon: '⚡',
      title: 'God Panel',
      desc: 'Application builder tools',
      minLevel: 4,
    },
    {
      href: tenantPath(tenant, '/super-god-panel'),
      icon: '👑',
      title: 'Super God',
      desc: 'Multi-tenant platform control',
      minLevel: 5,
    },
  ]
}

/** Only the tiles this level unlocks -- a locked tile is not shown. */
export function quickActionsFor(
  userLevel: number,
  tenant: string | null | undefined
): QuickAction[] {
  return allQuickActions(tenant).filter(a => userLevel >= a.minLevel)
}
