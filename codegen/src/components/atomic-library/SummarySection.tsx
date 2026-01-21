import { Heading, InfoPanel, Section, Separator, Text } from '@/components/atoms'
import { CheckCircle } from '@phosphor-icons/react'

type SummarySectionContent = (typeof import('@/data/atomic-library-showcase.json'))['sections']['summary']

interface SummarySectionProps {
  content: SummarySectionContent
}

export function SummarySection({ content }: SummarySectionProps) {
  return (
    <Section spacing="lg" className="pb-12">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <InfoPanel variant="success" icon={<CheckCircle />}>
        <Heading level={5} className="mb-2">
          {content.panelHeading}
        </Heading>
        <Text>{content.panelText}</Text>
      </InfoPanel>
    </Section>
  )
}
