/**
 * Mock data for the ui_level4 package
 * Mirrors the output of packages/ui_level4/seed/scripts/layout/render.lua
 */

import type { LuaRenderContext } from '../../types/lua-types'
import { registerMockPackage, type MockPackageDefinition } from '../lua-engine'

const uiLevel4Package: MockPackageDefinition = {
  metadata: {
    packageId: 'ui_level4',
    name: 'Level 4 - Admin Panel',
    version: '1.0.0',
    description: 'Admin panel for user and system management',
    category: 'ui',
    minLevel: 4,
    dependencies: ['ui_permissions', 'ui_header', 'ui_intro', 'user_manager', 'admin_dialog'],
    exports: {
      pages: ['level4'],
      scripts: ['layout', 'users', 'settings'],
    },
  },
  renders: {
    // Main layout render (from layout/render.lua)
    'layout.render': (ctx: LuaRenderContext) => {
      const nerdMode = ctx.nerdMode ?? false
      const username = ctx.user?.username ?? 'Admin'
      const desc = nerdMode
        ? 'Design declaratively with schemas and Lua scripts.'
        : 'Build visually with forms and drag-and-drop.'

      return {
        type: 'Box',
        props: { className: 'min-h-screen bg-canvas' },
        children: [
          {
            type: 'Level4Header',
            props: { username, nerdMode },
          },
          {
            type: 'Container',
            props: { className: 'max-w-7xl mx-auto px-4 py-8 space-y-8' },
            children: [
              {
                type: 'IntroSection',
                props: {
                  eyebrow: 'Level 4',
                  title: 'Application Builder',
                  description: desc,
                },
              },
              // Tabs section
              {
                type: 'Tabs',
                props: {
                  items: [
                    { value: 'schemas', label: 'Schemas' },
                    { value: 'workflows', label: 'Workflows' },
                    { value: 'users', label: 'Users' },
                    { value: 'settings', label: 'Settings' },
                  ],
                },
              },
            ],
          },
        ],
      }
    },

    // Schemas tab content
    'schemas.render': (_ctx: LuaRenderContext) => ({
      type: 'Stack',
      props: { className: 'space-y-4' },
      children: [
        {
          type: 'Card',
          children: [
            {
              type: 'CardHeader',
              children: [
                { type: 'Typography', props: { variant: 'h5', text: 'Schema Editor' } },
              ],
            },
            {
              type: 'CardContent',
              children: [
                {
                  type: 'Typography',
                  props: { 
                    variant: 'body2', 
                    text: 'Define data models and validation rules for your application.',
                    className: 'text-muted-foreground',
                  },
                },
                {
                  type: 'Button',
                  props: { variant: 'contained', children: 'Create Schema' },
                },
              ],
            },
          ],
        },
      ],
    }),

    // Workflows tab content
    'workflows.render': (_ctx: LuaRenderContext) => ({
      type: 'Stack',
      props: { className: 'space-y-4' },
      children: [
        {
          type: 'Card',
          children: [
            {
              type: 'CardHeader',
              children: [
                { type: 'Typography', props: { variant: 'h5', text: 'Workflow Designer' } },
              ],
            },
            {
              type: 'CardContent',
              children: [
                {
                  type: 'Typography',
                  props: { 
                    variant: 'body2', 
                    text: 'Create automated workflows with visual node-based editor.',
                    className: 'text-muted-foreground',
                  },
                },
                {
                  type: 'Button',
                  props: { variant: 'contained', children: 'New Workflow' },
                },
              ],
            },
          ],
        },
      ],
    }),
  },
}

// Register the package
registerMockPackage(uiLevel4Package)

export default uiLevel4Package
