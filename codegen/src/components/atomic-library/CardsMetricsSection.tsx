import { Heading, MetricCard, ResponsiveGrid, Section, Separator } from '@/components/atoms'
import { Bell, ShoppingCart, User } from '@phosphor-icons/react'

type CardsMetricsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['cardsMetrics']

interface CardsMetricsSectionProps {
  content: CardsMetricsSectionContent
}

const metricIcons = {
  user: <User size={24} />,
  cart: <ShoppingCart size={24} />,
  bell: <Bell size={24} />,
}

export function CardsMetricsSection({ content }: CardsMetricsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <ResponsiveGrid columns={3} gap="lg">
        {content.metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metricIcons[metric.icon]}
            trend={metric.trend}
          />
        ))}
      </ResponsiveGrid>
    </Section>
  )
}
