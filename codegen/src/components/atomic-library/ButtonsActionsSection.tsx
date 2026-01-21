import { ActionButton, Button, ButtonGroup, Flex, Heading, IconButton, Section, Separator, Stack, Text } from '@/components/atoms'
import { Download, Heart, Plus, Star, Trash } from '@phosphor-icons/react'

const iconMap = {
  download: <Download />,
  plus: <Plus />,
  star: <Star />,
  heart: <Heart />,
  trash: <Trash />,
}

type ButtonsActionsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['buttonsActions']

interface ButtonsActionsSectionProps {
  content: ButtonsActionsSectionContent
}

export function ButtonsActionsSection({ content }: ButtonsActionsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <Stack direction="vertical" spacing="md">
        <div>
          <Text variant="muted" className="mb-2">
            {content.buttonVariantsLabel}
          </Text>
          <Flex gap="md" wrap="wrap">
            {content.buttonVariants.map((variant) => (
              <Button
                key={variant.label}
                variant={variant.variant}
                loading={variant.loading}
                leftIcon={variant.iconPosition === 'left' ? iconMap[variant.icon ?? 'plus'] : undefined}
                rightIcon={variant.iconPosition === 'right' ? iconMap[variant.icon ?? 'download'] : undefined}
              >
                {variant.label}
              </Button>
            ))}
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.buttonGroupLabel}
          </Text>
          <ButtonGroup>
            {content.buttonGroupButtons.map((label) => (
              <Button key={label} variant="outline" size="sm">
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.iconButtonsLabel}
          </Text>
          <Flex gap="sm">
            <IconButton icon={<Heart />} variant="default" />
            <IconButton icon={<Star />} variant="secondary" />
            <IconButton icon={<Plus />} variant="outline" />
            <IconButton icon={<Trash />} variant="destructive" />
          </Flex>
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.actionButtonsLabel}
          </Text>
          <Flex gap="md" wrap="wrap">
            {content.actionButtons.map((action) => (
              <ActionButton
                key={action.label}
                icon={iconMap[action.icon]}
                label={action.label}
                onClick={() => {}}
                tooltip={action.tooltip}
                variant={action.variant}
              />
            ))}
          </Flex>
        </div>
      </Stack>
    </Section>
  )
}
