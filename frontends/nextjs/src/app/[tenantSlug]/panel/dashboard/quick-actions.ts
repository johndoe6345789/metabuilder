/** The dashboard's shortcut tiles, filtered to what the viewer may open. */

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
 */
export function allQuickActions(godPanelHref: string): QuickAction[] {
  return [
    {
      href: '/profile',
      icon: '👤',
      title: 'Profile',
      desc: 'Edit your profile information',
      minLevel: 1,
    },
    {
      href: '/comments',
      icon: '💬',
      title: 'Comments',
      desc: 'View community discussion',
      minLevel: 1,
    },
    {
      href: '/admin',
      icon: '🛡️',
      title: 'Admin Panel',
      desc: 'Manage users and data',
      minLevel: 3,
    },
    {
      href: godPanelHref,
      icon: '⚡',
      title: 'God Panel',
      desc: 'Application builder tools',
      minLevel: 4,
    },
    {
      href: '/super-god-panel',
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
  godPanelHref: string
): QuickAction[] {
  return allQuickActions(godPanelHref).filter(a => userLevel >= a.minLevel)
}
