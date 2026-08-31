import type { ProductPackage } from '../types'

export const ANALYTICS_PACKAGE: ProductPackage = {
  id: 'analytics',
  name: 'Analytics',
  tagline: 'Traffic, growth and engagement stats',
  icon: 'bar_chart',
  color: '#1A7A9A',
  features: [
    'Page views and unique visitor counts',
    'Member growth over time',
    'Top content and engagement metrics',
    'CSV data export',
  ],
  defaultRoutes: [{ path: '/analytics', title: 'Analytics' }],
  category: 'analytics',
}
