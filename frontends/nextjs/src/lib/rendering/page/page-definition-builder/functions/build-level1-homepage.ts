import type { PageDefinition } from './page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from '@/lib/database'

export function buildLevel1Homepage(): PageDefinition {
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
