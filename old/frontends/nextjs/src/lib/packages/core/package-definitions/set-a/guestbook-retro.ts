import type { PackageContent, PackageManifest } from '../../package-types'

export const guestbookRetroPackage = (): {
  manifest: PackageManifest
  content: PackageContent
} => ({
  manifest: {
    id: 'guestbook-retro',
    name: 'Retro Guestbook',
    version: '1.0.0',
    description:
      'Nostalgic 90s-style guestbook with animated GIFs, custom backgrounds, and visitor messages. Perfect for retro-themed websites.',
    author: 'MetaBuilder Team',
    category: 'content',
    icon: '📖',
    screenshots: [],
    tags: ['guestbook', 'retro', '90s', 'nostalgia'],
    dependencies: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    downloadCount: 892,
    rating: 4.5,
    installed: false,
  },
  content: {
    schemas: [
      {
        name: 'GuestbookEntry',
        displayName: 'Guestbook Entry',
        fields: [
          { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
          { name: 'authorName', type: 'string', label: 'Name', required: true },
          { name: 'authorEmail', type: 'string', label: 'Email', required: false },
          { name: 'authorWebsite', type: 'string', label: 'Website', required: false },
          { name: 'message', type: 'text', label: 'Message', required: true },
          { name: 'backgroundColor', type: 'string', label: 'Background Color', required: false },
          { name: 'textColor', type: 'string', label: 'Text Color', required: false },
          { name: 'gifUrl', type: 'string', label: 'GIF URL', required: false },
          {
            name: 'approved',
            type: 'boolean',
            label: 'Approved',
            required: true,
            defaultValue: false,
          },
          { name: 'createdAt', type: 'number', label: 'Created At', required: true },
        ],
      },
    ],
    pages: [
      {
        id: 'page_guestbook',
        path: '/guestbook',
        title: 'Guestbook',
        level: 1,
        componentTree: [],
        requiresAuth: false,
      },
    ],
    workflows: [],
    componentHierarchy: {},
    componentConfigs: {},
    seedData: {
      GuestbookEntry: [
        {
          id: 'entry_1',
          authorName: 'WebMaster99',
          authorWebsite: 'http://coolsite.net',
          message: 'Cool site! Check out mine too!',
          backgroundColor: '#FF00FF',
          textColor: '#00FF00',
          approved: true,
          createdAt: Date.now() - 86400000,
        },
      ],
    },
  },
})
