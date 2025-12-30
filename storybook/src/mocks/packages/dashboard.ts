/**
 * Mock data for the dashboard package
 * Mirrors the output of packages/dashboard/seed/scripts/
 */

import type { LuaRenderContext } from '../../types/lua-types'
import { registerMockPackage, type MockPackageDefinition } from '../lua-engine'

const dashboardPackage: MockPackageDefinition = {
  metadata: {
    packageId: 'dashboard',
    name: 'Dashboard',
    version: '1.0.0',
    description: 'Dashboard layouts, stat cards, and widgets',
    category: 'ui',
    minLevel: 2,
    exports: {
      components: ['StatCard', 'DashboardGrid', 'Widget'],
      scripts: ['stats', 'layout'],
    },
  },
  renders: {
    // Stats card render
    'stats.card': (_ctx: LuaRenderContext) => ({
      type: 'Card',
      props: { className: 'rounded-lg border shadow-sm' },
      children: [
        {
          type: 'CardContent',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Icon',
              props: { name: 'users', size: 'large', className: 'mb-2' },
            },
            {
              type: 'Typography',
              props: { variant: 'overline', text: 'Total Users', className: 'text-muted-foreground' },
            },
            {
              type: 'Typography',
              props: { variant: 'h4', text: '1,234' },
            },
            {
              type: 'Typography',
              props: { 
                variant: 'caption', 
                text: '+12.5%', 
                className: 'text-green-500' 
              },
            },
          ],
        },
      ],
    }),

    // Stats grid
    'stats.grid': (_ctx: LuaRenderContext) => ({
      type: 'Grid',
      props: { className: 'grid grid-cols-4 gap-4' },
      children: [
        {
          type: 'Card',
          children: [
            {
              type: 'CardContent',
              props: { className: 'p-6' },
              children: [
                { type: 'Typography', props: { variant: 'overline', text: 'Users' } },
                { type: 'Typography', props: { variant: 'h4', text: '1,234' } },
                { type: 'Typography', props: { variant: 'caption', text: '+12%', className: 'text-green-500' } },
              ],
            },
          ],
        },
        {
          type: 'Card',
          children: [
            {
              type: 'CardContent',
              props: { className: 'p-6' },
              children: [
                { type: 'Typography', props: { variant: 'overline', text: 'Revenue' } },
                { type: 'Typography', props: { variant: 'h4', text: '$45.2K' } },
                { type: 'Typography', props: { variant: 'caption', text: '+8.1%', className: 'text-green-500' } },
              ],
            },
          ],
        },
        {
          type: 'Card',
          children: [
            {
              type: 'CardContent',
              props: { className: 'p-6' },
              children: [
                { type: 'Typography', props: { variant: 'overline', text: 'Orders' } },
                { type: 'Typography', props: { variant: 'h4', text: '892' } },
                { type: 'Typography', props: { variant: 'caption', text: '-2.4%', className: 'text-red-500' } },
              ],
            },
          ],
        },
        {
          type: 'Card',
          children: [
            {
              type: 'CardContent',
              props: { className: 'p-6' },
              children: [
                { type: 'Typography', props: { variant: 'overline', text: 'Active' } },
                { type: 'Typography', props: { variant: 'h4', text: '573' } },
                { type: 'Typography', props: { variant: 'caption', text: '+18%', className: 'text-green-500' } },
              ],
            },
          ],
        },
      ],
    }),

    // Standard layout
    'layout.standard': (ctx: LuaRenderContext) => ({
      type: 'Box',
      props: { className: 'min-h-screen bg-background' },
      children: [
        {
          type: 'AppHeader',
          children: [
            {
              type: 'Flex',
              props: { className: 'flex items-center justify-between' },
              children: [
                { type: 'Typography', props: { variant: 'h5', text: 'Dashboard' } },
                { type: 'Typography', props: { variant: 'body2', text: ctx.user?.username || 'Guest' } },
              ],
            },
          ],
        },
        {
          type: 'Container',
          props: { className: 'max-w-7xl mx-auto px-4 py-8 space-y-8' },
          children: [
            {
              type: 'Typography',
              props: { variant: 'h3', text: 'Welcome back!' },
            },
            {
              type: 'Typography',
              props: { variant: 'body1', text: 'Here\'s what\'s happening with your projects.', className: 'text-muted-foreground' },
            },
          ],
        },
      ],
    }),
  },
}

// Register the package
registerMockPackage(dashboardPackage)

export default dashboardPackage
