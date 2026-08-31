import type { ProductPackage } from '../types'

export const PAGES_PACKAGE: ProductPackage = {
  id: 'pages',
  name: 'Pages',
  tagline: 'Custom pages and landing pages',
  icon: 'web',
  color: '#6750A4',
  features: [
    'Custom homepage with hero section',
    'About, contact and legal pages',
    'Visual page builder — 241 components',
    'SEO-friendly meta tags per page',
  ],
  defaultRoutes: [
    { path: '/', title: 'Home' },
    { path: '/about', title: 'About' },
    { path: '/contact', title: 'Contact' },
  ],
  category: 'core',
}
