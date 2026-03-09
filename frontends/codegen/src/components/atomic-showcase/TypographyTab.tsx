import typographyCopy from '@/data/atomic-showcase/typography.json'
import {
  Alert,
  Card,
  Chip,
  Code,
  Divider,
  Dot,
  Heading,
  Kbd,
  Link,
  Notification,
  ProgressBar,
  Skeleton,
  Spinner,
  Stack,
  StatusBadge,
  Tag,
  Text,
} from '@/components/atoms'

export function TypographyTab() {
  return (
    <Stack spacing="lg">
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{typographyCopy.sectionTitle}</Heading>
          <Divider />
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.headingsTitle}</Heading>
            {typographyCopy.headingSamples.map((sample) => (
              <Heading key={sample.text} level={sample.level}>
                {sample.text}
              </Heading>
            ))}
          </Stack>
          <Divider />
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.textVariantsTitle}</Heading>
            {typographyCopy.textVariants.map((variant) => (
              <Text key={variant.text} variant={variant.variant as any}>
                {variant.text}
              </Text>
            ))}
          </Stack>
          <Divider />
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.linksCodeTitle}</Heading>
            {typographyCopy.links.map((link) => (
              <Link key={link.label} href="#" variant={link.variant as any}>
                {link.label}
              </Link>
            ))}
            <Code inline>{typographyCopy.codeSample}</Code>
            <div>
              {typographyCopy.kbd.prefix} <Kbd>{typographyCopy.kbd.keys[0]}</Kbd> +{' '}
              <Kbd>{typographyCopy.kbd.keys[1]}</Kbd> {typographyCopy.kbd.suffix}
            </div>
          </Stack>
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{typographyCopy.badgesTitle}</Heading>
          <Divider />
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.statusBadgesTitle}</Heading>
            <Stack direction="horizontal" spacing="sm" wrap>
              {typographyCopy.statusBadges.map((status) => (
                <StatusBadge key={status} status={status as any} />
              ))}
            </Stack>
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.tagsTitle}</Heading>
            <Stack direction="horizontal" spacing="sm" wrap>
              {typographyCopy.tags.map((tag) => (
                <Tag key={tag.label} variant={tag.variant as any}>
                  {tag.label}
                </Tag>
              ))}
            </Stack>
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.dotsTitle}</Heading>
            <Stack direction="horizontal" spacing="sm" align="center">
              {typographyCopy.dots.map((dot) => (
                <Dot key={`${dot.variant}-${dot.pulse ?? false}`} variant={dot.variant as any} pulse={dot.pulse} />
              ))}
            </Stack>
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.chipsTitle}</Heading>
            <Stack direction="horizontal" spacing="sm" wrap>
              {typographyCopy.chips.map((chip) => (
                <Chip key={chip.label} variant={chip.variant as any}>
                  {chip.label}
                </Chip>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{typographyCopy.feedbackTitle}</Heading>
          <Divider />
          {typographyCopy.alerts.map((alert) => (
            <Alert key={alert.title} variant={alert.variant as any} title={alert.title}>
              {alert.message}
            </Alert>
          ))}
          <Notification
            type={typographyCopy.notification.type as any}
            title={typographyCopy.notification.title}
            message={typographyCopy.notification.message}
            onClose={() => {}}
          />
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.loadingTitle}</Heading>
            <Stack direction="horizontal" spacing="md" align="center">
              <Spinner size={16} />
              <Spinner size={24} />
              <Spinner size={32} />
            </Stack>
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.progressTitle}</Heading>
            {typographyCopy.progressBars.map((bar) => (
              <ProgressBar key={`${bar.value}-${bar.variant ?? 'default'}`} value={bar.value} showLabel={bar.showLabel} variant={bar.variant as any} />
            ))}
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{typographyCopy.skeletonTitle}</Heading>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="rounded" width="100%" height={100} />
            <Stack direction="horizontal" spacing="sm">
              <Skeleton variant="circular" width={40} height={40} />
              <Stack spacing="xs" className="flex-1">
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
