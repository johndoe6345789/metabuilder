import type { PageDefinition } from './page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from './database'

export class PageDefinitionBuilder {
  private pages: PageDefinition[] = []

  async initializeDefaultPages(): Promise<void> {
    const level1Homepage = this.buildLevel1Homepage()
    const level2UserDashboard = this.buildLevel2UserDashboard()
    const level3AdminPanel = this.buildLevel3AdminPanel()

    this.pages = [level1Homepage, level2UserDashboard, level3AdminPanel]

    for (const page of this.pages) {
      const existingPages = await Database.getPages()
      const exists = existingPages.some(p => p.id === page.id)
      
      if (!exists) {
        await Database.addPage({
          id: page.id,
          path: `/_page_${page.id}`,
          title: page.title,
          level: page.level,
          componentTree: page.components,
          requiresAuth: page.permissions?.requiresAuth || false,
          requiredRole: page.permissions?.requiredRole as any
        })
      }
    }
  }

  private buildLevel1Homepage(): PageDefinition {
    const heroComponent: ComponentInstance = {
      id: 'comp_hero',
      type: 'Container',
      props: {
        className: 'py-20 text-center bg-gradient-to-br from-primary/10 to-accent/10'
      },
      children: [
        {
          id: 'comp_hero_title',
          type: 'Heading',
          props: {
            level: 1,
            children: 'Welcome to MetaBuilder',
            className: 'text-5xl font-bold mb-4'
          },
          children: []
        },
        {
          id: 'comp_hero_subtitle',
          type: 'Text',
          props: {
            children: 'Build powerful multi-tenant applications with our declarative platform',
            className: 'text-xl text-muted-foreground mb-8'
          },
          children: []
        },
        {
          id: 'comp_hero_cta',
          type: 'Button',
          props: {
            children: 'Get Started',
            size: 'lg',
            variant: 'default',
            className: 'text-lg px-8 py-6'
          },
          children: []
        }
      ]
    }

    const featuresComponent: ComponentInstance = {
      id: 'comp_features',
      type: 'Container',
      props: {
        className: 'max-w-7xl mx-auto py-16 px-4'
      },
      children: [
        {
          id: 'comp_features_title',
          type: 'Heading',
          props: {
            level: 2,
            children: 'Platform Features',
            className: 'text-3xl font-bold text-center mb-12'
          },
          children: []
        },
        {
          id: 'comp_features_grid',
          type: 'Grid',
          props: {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-6'
          },
          children: [
            {
              id: 'comp_feature_1',
              type: 'Card',
              props: {
                className: 'p-6'
              },
              children: [
                {
                  id: 'comp_feature_1_icon',
                  type: 'Text',
                  props: {
                    children: '🚀',
                    className: 'text-4xl mb-4'
                  },
                  children: []
                },
                {
                  id: 'comp_feature_1_title',
                  type: 'Heading',
                  props: {
                    level: 3,
                    children: 'Fast Development',
                    className: 'text-xl font-semibold mb-2'
                  },
                  children: []
                },
                {
                  id: 'comp_feature_1_desc',
                  type: 'Text',
                  props: {
                    children: 'Build applications quickly with our declarative component system',
                    className: 'text-muted-foreground'
                  },
                  children: []
                }
              ]
            },
            {
              id: 'comp_feature_2',
              type: 'Card',
              props: {
                className: 'p-6'
              },
              children: [
                {
                  id: 'comp_feature_2_icon',
                  type: 'Text',
                  props: {
                    children: '🔒',
                    className: 'text-4xl mb-4'
                  },
                  children: []
                },
                {
                  id: 'comp_feature_2_title',
                  type: 'Heading',
                  props: {
                    level: 3,
                    children: 'Secure by Default',
                    className: 'text-xl font-semibold mb-2'
                  },
                  children: []
                },
                {
                  id: 'comp_feature_2_desc',
                  type: 'Text',
                  props: {
                    children: 'Enterprise-grade security with role-based access control',
                    className: 'text-muted-foreground'
                  },
                  children: []
                }
              ]
            },
            {
              id: 'comp_feature_3',
              type: 'Card',
              props: {
                className: 'p-6'
              },
              children: [
                {
                  id: 'comp_feature_3_icon',
                  type: 'Text',
                  props: {
                    children: '⚡',
                    className: 'text-4xl mb-4'
                  },
                  children: []
                },
                {
                  id: 'comp_feature_3_title',
                  type: 'Heading',
                  props: {
                    level: 3,
                    children: 'Lua Powered',
                    className: 'text-xl font-semibold mb-2'
                  },
                  children: []
                },
                {
                  id: 'comp_feature_3_desc',
                  type: 'Text',
                  props: {
                    children: 'Extend functionality with custom Lua scripts and workflows',
                    className: 'text-muted-foreground'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }

    return {
      id: 'page_level1_home',
      level: 1,
      title: 'MetaBuilder - Homepage',
      description: 'Public homepage with hero section and features',
      layout: 'default',
      components: [heroComponent, featuresComponent],
      permissions: {
        requiresAuth: false
      },
      metadata: {
        showHeader: true,
        showFooter: true,
        headerTitle: 'MetaBuilder',
        headerActions: [
          {
            id: 'header_login_btn',
            type: 'Button',
            props: {
              children: 'Login',
              variant: 'default',
              size: 'sm'
            },
            children: []
          }
        ]
      }
    }
  }

  private buildLevel2UserDashboard(): PageDefinition {
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

  private buildLevel3AdminPanel(): PageDefinition {
    const userManagementCard: ComponentInstance = {
      id: 'comp_user_mgmt',
      type: 'Card',
      props: {
        className: 'p-6'
      },
      children: [
        {
          id: 'comp_user_mgmt_header',
          type: 'Heading',
          props: {
            level: 2,
            children: 'User Management',
            className: 'text-2xl font-bold mb-4'
          },
          children: []
        },
        {
          id: 'comp_user_mgmt_table',
          type: 'Table',
          props: {
            className: 'w-full'
          },
          children: []
        }
      ]
    }

    const contentModerationCard: ComponentInstance = {
      id: 'comp_content_mod',
      type: 'Card',
      props: {
        className: 'p-6'
      },
      children: [
        {
          id: 'comp_content_mod_header',
          type: 'Heading',
          props: {
            level: 2,
            children: 'Content Moderation',
            className: 'text-2xl font-bold mb-4'
          },
          children: []
        },
        {
          id: 'comp_content_mod_table',
          type: 'Table',
          props: {
            className: 'w-full'
          },
          children: []
        }
      ]
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
        requiredRole: 'admin'
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
            target: '3'
          },
          {
            id: 'nav_content',
            label: 'Content',
            icon: '📝',
            action: 'navigate',
            target: '3'
          },
          {
            id: 'nav_settings',
            label: 'Settings',
            icon: '⚙️',
            action: 'navigate',
            target: '3'
          }
        ]
      }
    }
  }

  getPages(): PageDefinition[] {
    return this.pages
  }
}

let builderInstance: PageDefinitionBuilder | null = null

export function getPageDefinitionBuilder(): PageDefinitionBuilder {
  if (!builderInstance) {
    builderInstance = new PageDefinitionBuilder()
  }
  return builderInstance
}
