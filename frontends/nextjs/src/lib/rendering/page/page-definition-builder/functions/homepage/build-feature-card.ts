import type { ComponentInstance } from '@/lib/rendering/page/builder-types'

interface FeatureCardContent {
  id: string
  icon: string
  title: string
  description: string
}

export const buildFeatureCard = ({ id, icon, title, description }: FeatureCardContent): ComponentInstance => ({
  id: `comp_feature_${id}`,
  type: 'Card',
  props: {
    className: 'p-6'
  },
  children: [
    {
      id: `comp_feature_${id}_icon`,
      type: 'Text',
      props: {
        children: icon,
        className: 'text-4xl mb-4'
      },
      children: []
    },
    {
      id: `comp_feature_${id}_title`,
      type: 'Heading',
      props: {
        level: 3,
        children: title,
        className: 'text-xl font-semibold mb-2'
      },
      children: []
    },
    {
      id: `comp_feature_${id}_desc`,
      type: 'Text',
      props: {
        children: description,
        className: 'text-muted-foreground'
      },
      children: []
    }
  ]
})
