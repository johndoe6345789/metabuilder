import { Database } from '@/lib/database'
import { buildCommentsCard, buildProfileCard } from '@/lib/rendering/page/components'
import type { PageDefinition } from '@/lib/rendering/page/page-renderer'

export function buildLevel2UserDashboard(): PageDefinition {
  return {
    id: 'page_level2_dashboard',
    level: 2,
    title: 'User Dashboard',
    description: 'User dashboard with profile and comments',
    layout: 'dashboard',
    components: [buildProfileCard(), buildCommentsCard()],
    permissions: {
      requiresAuth: true,
      requiredRole: 'user',
    },
    metadata: {
      showHeader: true,
      showFooter: false,
      headerTitle: 'Dashboard',
      sidebarItems: [
        {
          id: 'nav_home',
          label: 'Home',
          icon: '🏠',
          action: 'navigate',
          target: '1',
        },
        {
          id: 'nav_profile',
          label: 'Profile',
          icon: '👤',
          action: 'navigate',
          target: '2',
        },
        {
          id: 'nav_chat',
          label: 'Chat',
          icon: '💬',
          action: 'navigate',
          target: '2',
        },
      ],
    },
  }
}
