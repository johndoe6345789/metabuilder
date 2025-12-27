import type { ComponentInstance } from '@/lib/rendering/page/builder-types'

export const buildHeroComponent = (): ComponentInstance => ({
  id: 'comp_hero',
  type: 'Container',
  props: {
    className: 'py-20 text-center bg-gradient-to-br from-primary/10 to-accent/10'
  },
  children: [
    {
      id: 'comp_hero_title',
      type: 'Heading',
      props: {
        level: 1,
        children: 'Welcome to MetaBuilder',
        className: 'text-5xl font-bold mb-4'
      },
      children: []
    },
    {
      id: 'comp_hero_subtitle',
      type: 'Text',
      props: {
        children: 'Build powerful multi-tenant applications with our declarative platform',
        className: 'text-xl text-muted-foreground mb-8'
      },
      children: []
    },
    {
      id: 'comp_hero_cta',
      type: 'Button',
      props: {
        children: 'Get Started',
        size: 'lg',
        variant: 'default',
        className: 'text-lg px-8 py-6'
      },
      children: []
    }
  ]
})
