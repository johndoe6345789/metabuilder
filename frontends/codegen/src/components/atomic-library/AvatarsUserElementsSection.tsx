import { Avatar, AvatarGroup, Flex, Heading, Section, Separator, Stack, Text } from '@/components/atoms'

type AvatarsUserElementsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['avatarsUserElements']

interface AvatarsUserElementsSectionProps {
  content: AvatarsUserElementsSectionContent
}

const avatarSizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl']

export function AvatarsUserElementsSection({ content }: AvatarsUserElementsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        <div>
          <Text variant="muted" className="mb-2">
            {content.avatarSizesLabel}
          </Text>
          <Flex gap="md" align="center">
            {content.avatarFallbacks.map((fallback, index) => (
              <Avatar key={fallback} fallback={fallback} size={avatarSizes[index]} />
            ))}
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.avatarGroupLabel}
          </Text>
          <AvatarGroup avatars={content.avatarGroup} max={5} />
        </div>
      </Stack>
    </Section>
  )
}
