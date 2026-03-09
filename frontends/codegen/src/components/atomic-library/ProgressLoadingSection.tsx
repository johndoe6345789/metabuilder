import {
  CircularProgress,
  Heading,
  ProgressBar,
  Section,
  Separator,
  Spacer,
  Stack,
  Text,
  Flex,
  Skeleton,
} from '@/components/atoms'

type ProgressLoadingSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['progressLoading']

interface ProgressLoadingSectionProps {
  content: ProgressLoadingSectionContent
}

export function ProgressLoadingSection({ content }: ProgressLoadingSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        <div>
          <Text variant="muted" className="mb-2">
            {content.progressBarLabel}
          </Text>
          <ProgressBar value={65} showLabel />
          <Spacer size="sm" axis="vertical" />
          <ProgressBar value={80} variant="accent" size="sm" />
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.circularProgressLabel}
          </Text>
          <Flex gap="lg">
            <CircularProgress value={25} size="sm" />
            <CircularProgress value={50} size="md" />
            <CircularProgress value={75} size="lg" />
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.skeletonLabel}
          </Text>
          <Stack direction="vertical" spacing="sm">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rounded" width="100%" height={100} />
          </Stack>
        </div>
      </Stack>
    </Section>
  )
}
