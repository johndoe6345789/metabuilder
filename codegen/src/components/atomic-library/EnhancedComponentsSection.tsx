import {
  Button,
  Flex,
  GlowCard,
  Heading,
  LiveIndicator,
  NumberInput,
  PanelHeader,
  Pulse,
  QuickActionButton,
  ResponsiveGrid,
  Section,
  Separator,
  Sparkle,
  Stack,
  Text,
  TextGradient,
} from '@/components/atoms'
import { Code as CodeIcon, Rocket, ShoppingCart, Star } from '@phosphor-icons/react'

type EnhancedComponentsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['enhancedComponents']

interface EnhancedComponentsSectionProps {
  content: EnhancedComponentsSectionContent
  numberValue: number
  onNumberChange: (value: number) => void
}

const quickActionIcons = [
  <CodeIcon key="code" size={32} weight="duotone" />,
  <Rocket key="rocket" size={32} weight="duotone" />,
  <Star key="star" size={32} weight="duotone" />,
  <ShoppingCart key="cart" size={32} weight="duotone" />,
]

export function EnhancedComponentsSection({
  content,
  numberValue,
  onNumberChange,
}: EnhancedComponentsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="lg">
        <div>
          <PanelHeader
            title={content.panelHeader.title}
            subtitle={content.panelHeader.subtitle}
            icon={<Rocket size={24} weight="duotone" />}
            actions={
              <Button size="sm" variant="outline">
                {content.panelHeader.actionLabel}
              </Button>
            }
          />
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.numberInputLabel}
          </Text>
          <NumberInput
            label={content.numberInput.label}
            value={numberValue}
            onChange={onNumberChange}
            min={0}
            max={100}
            step={5}
          />
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.textGradientLabel}
          </Text>
          <Heading level={2}>
            <TextGradient from="from-primary" to="to-accent">
              {content.textGradientText}
            </TextGradient>
          </Heading>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.statusIndicatorsLabel}
          </Text>
          <Flex gap="lg" align="center">
            <Flex gap="sm" align="center">
              <Pulse variant="success" />
              <Text variant="small">{content.statusActiveLabel}</Text>
            </Flex>
            <LiveIndicator />
            <Flex gap="sm" align="center">
              <Sparkle variant="gold" />
              <Text variant="small">{content.statusFeaturedLabel}</Text>
            </Flex>
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.quickActionButtonsLabel}
          </Text>
          <ResponsiveGrid columns={4} gap="md">
            {content.quickActionButtons.map((button, index) => (
              <QuickActionButton
                key={button.label}
                icon={quickActionIcons[index]}
                label={button.label}
                description={button.description}
                variant={button.variant}
                onClick={() => alert(button.alertMessage)}
              />
            ))}
          </ResponsiveGrid>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.glowCardsLabel}
          </Text>
          <ResponsiveGrid columns={3} gap="md">
            {content.glowCards.map((card) => (
              <GlowCard key={card.title} glowColor={card.glowColor} intensity={card.intensity}>
                <div className="p-4">
                  <Heading level={4}>{card.title}</Heading>
                  <Text variant="muted" className="mt-2">
                    {card.description}
                  </Text>
                </div>
              </GlowCard>
            ))}
          </ResponsiveGrid>
        </div>
      </Stack>
    </Section>
  )
}
