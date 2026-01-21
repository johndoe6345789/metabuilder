import { Alert, Heading, InfoPanel, ResponsiveGrid, Section, Separator, Spacer, Stack } from '@/components/atoms'
import { CheckCircle, Info, WarningCircle, XCircle } from '@phosphor-icons/react'

type FeedbackSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['feedback']

interface FeedbackSectionProps {
  content: FeedbackSectionContent
}

const infoPanelIcons = {
  info: <Info />,
  success: <CheckCircle />,
  warning: <WarningCircle />,
  error: <XCircle />,
}

export function FeedbackSection({ content }: FeedbackSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        {content.alerts.map((alert) => (
          <Alert key={alert.title} variant={alert.variant} title={alert.title}>
            {alert.message}
          </Alert>
        ))}

        <Spacer size="sm" axis="vertical" />

        <ResponsiveGrid columns={2} gap="md">
          {content.infoPanels.map((panel) => (
            <InfoPanel
              key={panel.title}
              variant={panel.variant}
              title={panel.title}
              icon={infoPanelIcons[panel.variant]}
            >
              {panel.message}
            </InfoPanel>
          ))}
        </ResponsiveGrid>
      </Stack>
    </Section>
  )
}
