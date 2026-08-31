import type { ProductPackage } from '../types'

export const MEMBERS_PACKAGE: ProductPackage = {
  id: 'members',
  name: 'Members',
  tagline: 'Sign-up, profiles and access control',
  icon: 'group',
  color: '#197A3E',
  features: [
    'Member sign-up and login',
    'Profile pages and avatars',
    'Role-based access (public / member / admin)',
    'Private areas for paid members',
  ],
  defaultRoutes: [
    { path: '/members', title: 'Member Directory' },
    { path: '/profile', title: 'My Profile' },
  ],
  category: 'members',
}
