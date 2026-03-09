import { Code, Heading, Kbd, Link, Section, Separator, Stack, Text } from '@/components/atoms'

type TypographySectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['typography']

interface TypographySectionProps {
  content: TypographySectionContent
}

export function TypographySection({ content }: TypographySectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        <div>
          <Text variant="muted" className="mb-2">
            {content.headingsLabel}
          </Text>
          <Stack direction="vertical" spacing="sm">
            {content.headings.map((label, index) => (
              <Heading key={label} level={(index + 1) as 1 | 2 | 3 | 4 | 5 | 6}>
                {label}
              </Heading>
            ))}
          </Stack>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.textVariantsLabel}
          </Text>
          <Stack direction="vertical" spacing="sm">
            <Text variant="body">{content.textVariants[0]}</Text>
            <Text variant="caption">{content.textVariants[1]}</Text>
            <Text variant="muted">{content.textVariants[2]}</Text>
            <Text variant="small">{content.textVariants[3]}</Text>
          </Stack>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.inlineElementsLabel}
          </Text>
          <Stack direction="vertical" spacing="sm">
            <Text>
              {content.inlineElements.kbd.before} <Kbd>{content.inlineElements.kbd.keys[0]}</Kbd> +
              <Kbd>{content.inlineElements.kbd.keys[1]}</Kbd> {content.inlineElements.kbd.after}
            </Text>
            <Text>
              {content.inlineElements.code.before} <Code inline>{content.inlineElements.code.content}</Code>{' '}
              {content.inlineElements.code.after}
            </Text>
            <Text>
              {content.inlineElements.link.before}{' '}
              <Link href="#">{content.inlineElements.link.content}</Link>{' '}
              {content.inlineElements.link.after}
            </Text>
          </Stack>
        </div>
      </Stack>
    </Section>
  )
}
