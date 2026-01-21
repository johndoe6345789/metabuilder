import { Badge, Button, Card, Flex, Heading, ResponsiveGrid, Section, Separator, Stack, Text } from '@/components/atoms'

type LayoutComponentsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['layoutComponents']

interface LayoutComponentsSectionProps {
  content: LayoutComponentsSectionContent
}

const gridItems = [1, 2, 3, 4, 5, 6, 7, 8]

export function LayoutComponentsSection({ content }: LayoutComponentsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        <div>
          <Text variant="muted" className="mb-2">
            {content.responsiveGridLabel}
          </Text>
          <ResponsiveGrid columns={4} gap="md">
            {gridItems.map((item) => (
              <Card key={item} className="p-4 text-center">
                <Text>
                  {content.gridItemLabel} {item}
                </Text>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.flexLayoutLabel}
          </Text>
          <Flex justify="between" align="center" className="p-4 border rounded-md">
            <Text>{content.flexLeft}</Text>
            <Badge>{content.flexCenter}</Badge>
            <Button size="sm">{content.flexRightAction}</Button>
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.stackLayoutLabel}
          </Text>
          <Stack direction="vertical" spacing="sm" className="p-4 border rounded-md">
            {content.stackItems.map((item) => (
              <Text key={item}>{item}</Text>
            ))}
          </Stack>
        </div>
      </Stack>
    </Section>
  )
}
