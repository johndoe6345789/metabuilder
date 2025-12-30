/**
 * Mock data for the user_manager package
 * Mirrors the output of packages/user_manager/seed/scripts/
 */

import type { LuaRenderContext } from '../../types/lua-types'
import { registerMockPackage, type MockPackageDefinition } from '../lua-engine'

const userManagerPackage: MockPackageDefinition = {
  metadata: {
    packageId: 'user_manager',
    name: 'User Manager',
    version: '1.0.0',
    description: 'User management with roles and permissions',
    category: 'admin',
    minLevel: 4,
    exports: {
      scripts: ['list', 'create_user', 'update_user', 'delete_user', 'change_level'],
    },
  },
  renders: {
    // User table render
    'render_users': (_ctx: LuaRenderContext) => ({
      type: 'Card',
      children: [
        {
          type: 'CardHeader',
          children: [
            {
              type: 'Flex',
              props: { className: 'flex items-center justify-between' },
              children: [
                { type: 'Typography', props: { variant: 'h5', text: 'Users' } },
                { type: 'Button', props: { variant: 'contained', children: 'Add User' } },
              ],
            },
          ],
        },
        {
          type: 'CardContent',
          children: [
            {
              type: 'Box',
              props: { className: 'overflow-hidden rounded border' },
              children: [
                // Table header
                {
                  type: 'Flex',
                  props: { className: 'flex p-4 bg-muted font-medium border-b' },
                  children: [
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'Username' } }] },
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'Email' } }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Typography', props: { text: 'Level' } }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Typography', props: { text: 'Status' } }] },
                    { type: 'Box', props: { className: 'w-32' }, children: [{ type: 'Typography', props: { text: 'Actions' } }] },
                  ],
                },
                // Table rows
                {
                  type: 'Flex',
                  props: { className: 'flex p-4 border-b items-center' },
                  children: [
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'admin' } }] },
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'admin@example.com', className: 'text-muted-foreground' } }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Badge', children: [{ type: 'Typography', props: { text: '6' } }] }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Chip', props: { label: 'Active', className: 'bg-green-100 text-green-800' } }] },
                    { type: 'Box', props: { className: 'w-32 flex gap-2' }, children: [
                      { type: 'Button', props: { variant: 'text', size: 'small', children: 'Edit' } },
                    ] },
                  ],
                },
                {
                  type: 'Flex',
                  props: { className: 'flex p-4 border-b items-center' },
                  children: [
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'moderator' } }] },
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'mod@example.com', className: 'text-muted-foreground' } }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Badge', children: [{ type: 'Typography', props: { text: '3' } }] }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Chip', props: { label: 'Active', className: 'bg-green-100 text-green-800' } }] },
                    { type: 'Box', props: { className: 'w-32 flex gap-2' }, children: [
                      { type: 'Button', props: { variant: 'text', size: 'small', children: 'Edit' } },
                      { type: 'Button', props: { variant: 'text', size: 'small', children: 'Delete' } },
                    ] },
                  ],
                },
                {
                  type: 'Flex',
                  props: { className: 'flex p-4 items-center' },
                  children: [
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'user1' } }] },
                    { type: 'Box', props: { className: 'flex-1' }, children: [{ type: 'Typography', props: { text: 'user1@example.com', className: 'text-muted-foreground' } }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Badge', children: [{ type: 'Typography', props: { text: '2' } }] }] },
                    { type: 'Box', props: { className: 'w-24' }, children: [{ type: 'Chip', props: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' } }] },
                    { type: 'Box', props: { className: 'w-32 flex gap-2' }, children: [
                      { type: 'Button', props: { variant: 'text', size: 'small', children: 'Edit' } },
                      { type: 'Button', props: { variant: 'text', size: 'small', children: 'Delete' } },
                    ] },
                  ],
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
registerMockPackage(userManagerPackage)

export default userManagerPackage
