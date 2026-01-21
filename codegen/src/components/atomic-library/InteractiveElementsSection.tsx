import {
  Button,
  ColorSwatch,
  Flex,
  Heading,
  HoverCard,
  Section,
  Separator,
  Stack,
  Text,
  Tooltip,
} from '@/components/atoms'

type InteractiveElementsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['interactiveElements']

interface InteractiveElementsSectionProps {
  content: InteractiveElementsSectionContent
}

export function InteractiveElementsSection({ content }: InteractiveElementsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        <div>
          <Text variant="muted" className="mb-2">
            {content.hoverCardLabel}
          </Text>
          <HoverCard trigger={<Button variant="outline">{content.hoverCardTrigger}</Button>}>
            <Stack direction="vertical" spacing="sm">
              <Heading level={5}>{content.hoverCardTitle}</Heading>
              <Text variant="muted">{content.hoverCardDescription}</Text>
            </Stack>
          </HoverCard>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.tooltipLabel}
          </Text>
          <Tooltip content={content.tooltipContent}>
            <Button variant="outline">{content.tooltipTrigger}</Button>
          </Tooltip>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.colorSwatchesLabel}
          </Text>
          <Flex gap="sm">
            {content.colorSwatches.map((swatch) => (
              <ColorSwatch key={swatch.label} color={swatch.color} label={swatch.label} />
            ))}
          </Flex>
        </div>
      </Stack>
    </Section>
  )
}
