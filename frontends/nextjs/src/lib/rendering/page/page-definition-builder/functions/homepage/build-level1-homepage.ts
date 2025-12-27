import type { PageDefinition } from '@/lib/rendering/page/page-renderer'
import type { ComponentInstance } from '@/lib/rendering/page/builder-types'
import { buildFeaturesComponent } from './build-features-component'
import { buildHeroComponent } from './build-hero-component'

const buildHeaderActions = (): ComponentInstance[] => [
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

export const buildLevel1Homepage = (): PageDefinition => {
  const heroComponent = buildHeroComponent()
  const featuresComponent = buildFeaturesComponent()

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
      headerActions: buildHeaderActions()
    }
  }
}
