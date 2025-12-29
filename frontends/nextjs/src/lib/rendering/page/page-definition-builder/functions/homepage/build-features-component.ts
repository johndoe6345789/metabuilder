import type { ComponentInstance } from '@/lib/rendering/page/builder-types'
import { buildFeatureCard } from './build-feature-card'

const FEATURE_CARDS: Array<{
  id: string
  icon: string
  title: string
  description: string
}> = [
  {
    id: '1',
    icon: '🚀',
    title: 'Fast Development',
    description: 'Build applications quickly with our declarative component system',
  },
  {
    id: '2',
    icon: '🔒',
    title: 'Secure by Default',
    description: 'Enterprise-grade security with role-based access control',
  },
  {
    id: '3',
    icon: '⚡',
    title: 'Lua Powered',
    description: 'Extend functionality with custom Lua scripts and workflows',
  },
]

export const buildFeaturesComponent = (): ComponentInstance => ({
  id: 'comp_features',
  type: 'Container',
  props: {
    className: 'max-w-7xl mx-auto py-16 px-4',
  },
  children: [
    {
      id: 'comp_features_title',
      type: 'Heading',
      props: {
        level: 2,
        children: 'Platform Features',
        className: 'text-3xl font-bold text-center mb-12',
      },
      children: [],
    },
    {
      id: 'comp_features_grid',
      type: 'Grid',
      props: {
        className: 'grid grid-cols-1 md:grid-cols-3 gap-6',
      },
      children: FEATURE_CARDS.map(buildFeatureCard),
    },
  ],
})
