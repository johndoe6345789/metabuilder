import type { ProductPackage } from '../types'

export const COMMUNITY_PACKAGE: ProductPackage = {
  id: 'community',
  name: 'Community',
  tagline: 'Forums, chat and comments',
  icon: 'forum',
  color: '#0B6BCB',
  features: [
    'Discussion forums with threads',
    'Real-time chat rooms',
    'Comment threads on any page',
    'Member activity feed',
  ],
  defaultRoutes: [
    { path: '/community', title: 'Community' },
    { path: '/chat', title: 'Chat' },
  ],
  category: 'social',
}
