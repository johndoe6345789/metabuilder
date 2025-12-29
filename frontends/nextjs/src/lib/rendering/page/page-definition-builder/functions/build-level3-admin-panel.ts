import type { PageDefinition } from '@/lib/rendering/page/page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from '@/lib/database'

export function buildLevel3AdminPanel(): PageDefinition {
  const userManagementCard: ComponentInstance = {
    id: 'comp_user_mgmt',
    type: 'Card',
    props: {
      className: 'p-6',
    },
    children: [
      {
        id: 'comp_user_mgmt_header',
        type: 'Heading',
        props: {
          level: 2,
          children: 'User Management',
          className: 'text-2xl font-bold mb-4',
        },
        children: [],
      },
      {
        id: 'comp_user_mgmt_table',
        type: 'Table',
        props: {
          className: 'w-full',
        },
        children: [],
      },
    ],
  }

  const contentModerationCard: ComponentInstance = {
    id: 'comp_content_mod',
    type: 'Card',
    props: {
      className: 'p-6',
    },
    children: [
      {
        id: 'comp_content_mod_header',
        type: 'Heading',
        props: {
          level: 2,
          children: 'Content Moderation',
          className: 'text-2xl font-bold mb-4',
        },
        children: [],
      },
      {
        id: 'comp_content_mod_table',
        type: 'Table',
        props: {
          className: 'w-full',
        },
        children: [],
      },
    ],
  }

  return {
    id: 'page_level3_admin',
    level: 3,
    title: 'Admin Panel',
    description: 'Administrative control panel for managing users and content',
    layout: 'dashboard',
    components: [userManagementCard, contentModerationCard],
    permissions: {
      requiresAuth: true,
      requiredRole: 'admin',
    },
    metadata: {
      showHeader: true,
      showFooter: false,
      headerTitle: 'Admin Panel',
      sidebarItems: [
        {
          id: 'nav_users',
          label: 'Users',
          icon: '👥',
          action: 'navigate',
          target: '3',
        },
        {
          id: 'nav_content',
          label: 'Content',
          icon: '📝',
          action: 'navigate',
          target: '3',
        },
        {
          id: 'nav_settings',
          label: 'Settings',
          icon: '⚙️',
          action: 'navigate',
          target: '3',
        },
      ],
    },
  }
}
