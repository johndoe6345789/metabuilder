import type { PageDefinition } from './page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from '@/lib/database'

export function buildLevel2UserDashboard(): PageDefinition {
    const profileCard: ComponentInstance = {
      id: 'comp_profile',
      type: 'Card',
      props: {
        className: 'p-6'
      },
      children: [
        {
          id: 'comp_profile_header',
          type: 'Heading',
          props: {
            level: 2,
            children: 'User Profile',
            className: 'text-2xl font-bold mb-4'
          },
          children: []
        },
        {
          id: 'comp_profile_content',
          type: 'Container',
          props: {
            className: 'space-y-4'
          },
          children: [
            {
              id: 'comp_profile_bio',
              type: 'Textarea',
              props: {
                placeholder: 'Tell us about yourself...',
                className: 'min-h-32'
              },
              children: []
            },
            {
              id: 'comp_profile_save',
              type: 'Button',
              props: {
                children: 'Save Profile',
                variant: 'default'
              },
              children: []
            }
          ]
        }
      ]
    }

    const commentsCard: ComponentInstance = {
      id: 'comp_comments',
      type: 'Card',
      props: {
        className: 'p-6'
      },
      children: [
        {
          id: 'comp_comments_header',
          type: 'Heading',
          props: {
            level: 2,
            children: 'Community Comments',
            className: 'text-2xl font-bold mb-4'
          },
          children: []
        },
        {
          id: 'comp_comments_input',
          type: 'Textarea',
          props: {
            placeholder: 'Share your thoughts...',
            className: 'mb-4'
          },
          children: []
        },
        {
          id: 'comp_comments_post',
          type: 'Button',
          props: {
            children: 'Post Comment',
            variant: 'default'
          },
          children: []
        }
      ]
    }

    return {
      id: 'page_level2_dashboard',
      level: 2,
      title: 'User Dashboard',
      description: 'User dashboard with profile and comments',
      layout: 'dashboard',
      components: [profileCard, commentsCard],
      permissions: {
        requiresAuth: true,
        requiredRole: 'user'
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
            target: '1'
          },
          {
            id: 'nav_profile',
            label: 'Profile',
            icon: '👤',
            action: 'navigate',
            target: '2'
          },
          {
            id: 'nav_chat',
            label: 'Chat',
            icon: '💬',
            action: 'navigate',
            target: '2'
          }
        ]
      }
    }
}
