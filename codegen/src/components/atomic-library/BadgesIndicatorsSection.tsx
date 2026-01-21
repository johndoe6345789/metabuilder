import { Badge, Chip, CountBadge, Dot, Flex, Heading, Section, Separator, Stack, StatusBadge, Text } from '@/components/atoms'
import { Star } from '@phosphor-icons/react'

type BadgesIndicatorsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['badgesIndicators']

interface BadgesIndicatorsSectionProps {
  content: BadgesIndicatorsSectionContent
}

export function BadgesIndicatorsSection({ content }: BadgesIndicatorsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        <div>
          <Text variant="muted" className="mb-2">
            {content.badgesLabel}
          </Text>
          <Flex gap="sm" wrap="wrap">
            {content.badges.map((badge) => (
              <Badge key={badge.label} variant={badge.variant} size={badge.size} icon={badge.icon ? <Star /> : undefined}>
                {badge.label}
              </Badge>
            ))}
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.statusBadgesLabel}
          </Text>
          <Flex gap="sm" wrap="wrap">
            <StatusBadge status="active" />
            <StatusBadge status="inactive" />
            <StatusBadge status="pending" />
            <StatusBadge status="error" />
            <StatusBadge status="success" />
            <StatusBadge status="warning" />
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.chipsLabel}
          </Text>
          <Flex gap="sm" wrap="wrap">
            {content.chips.map((chip) => (
              <Chip
                key={chip.label}
                variant={chip.variant}
                onRemove={chip.removable ? () => {} : undefined}
              >
                {chip.label}
              </Chip>
            ))}
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.dotsLabel}
          </Text>
          <Flex gap="md" align="center">
            <Dot variant="default" />
            <Dot variant="primary" />
            <Dot variant="accent" />
            <Dot variant="success" pulse />
            <Dot variant="warning" pulse />
            <Dot variant="error" pulse />
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.countBadgeLabel}
          </Text>
          <Flex gap="md">
            {content.countItems.map((item) => (
              <div key={item.label} className="flex items-center">
                <Text>{item.label}</Text>
                <CountBadge count={item.count} max={item.max} variant={item.variant} />
              </div>
            ))}
          </Flex>
        </div>
      </Stack>
    </Section>
  )
}
