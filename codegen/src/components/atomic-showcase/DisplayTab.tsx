import displayCopy from '@/data/atomic-showcase/display.json'
import {
  Avatar,
  Breadcrumb,
  Card,
  ColorSwatch,
  Divider,
  Heading,
  Stack,
  StatusBadge,
  Stepper,
  Table,
  Text,
  Timeline,
  Timestamp,
} from '@/components/atoms'
import { Accordion, Rating } from '@/lib/json-ui/json-components'

type DisplayTabProps = {
  ratingValue: number
  selectedColor: string
  onRatingChange: (value: number) => void
  onColorChange: (value: string) => void
}

export function DisplayTab({ ratingValue, selectedColor, onRatingChange, onColorChange }: DisplayTabProps) {
  const tableColumns = displayCopy.tableColumns.map((column) =>
    column.key === 'status'
      ? { ...column, render: (item: { status: string }) => <StatusBadge status={item.status as any} /> }
      : column
  )

  return (
    <Stack spacing="lg">
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{displayCopy.displayTitle}</Heading>
          <Divider />
          <Stack spacing="sm">
            <Heading level={3}>{displayCopy.avatarTitle}</Heading>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Avatar fallback={displayCopy.avatarFallback} size="xs" />
              <Avatar fallback={displayCopy.avatarFallback} size="sm" />
              <Avatar fallback={displayCopy.avatarFallback} size="md" />
              <Avatar fallback={displayCopy.avatarFallback} size="lg" />
              <Avatar fallback={displayCopy.avatarFallback} size="xl" />
            </Stack>
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{displayCopy.ratingTitle}</Heading>
            <Rating value={ratingValue} onChange={onRatingChange} max={5} showValue />
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{displayCopy.colorSwatchesTitle}</Heading>
            <Stack direction="horizontal" spacing="sm">
              {displayCopy.colorSwatches.map((swatch) => (
                <ColorSwatch
                  key={swatch.color}
                  color={swatch.color}
                  selected={selectedColor === swatch.color}
                  onClick={() => onColorChange(swatch.color)}
                  label={swatch.label}
                />
              ))}
            </Stack>
          </Stack>
          <Stack spacing="sm">
            <Heading level={3}>{displayCopy.timestampTitle}</Heading>
            <Timestamp date={new Date()} />
            <Timestamp date={new Date(Date.now() - 3600000)} relative />
          </Stack>
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{displayCopy.stepperTitle}</Heading>
          <Divider />
          <Stepper steps={displayCopy.stepperSteps} currentStep={1} />
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{displayCopy.timelineTitle}</Heading>
          <Divider />
          <Timeline items={displayCopy.timelineItems} />
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{displayCopy.tableTitle}</Heading>
          <Divider />
          <Table data={displayCopy.tableData} columns={tableColumns} striped hoverable />
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{displayCopy.accordionTitle}</Heading>
          <Divider />
          <Accordion
            items={displayCopy.accordionItems.map((item) => ({
              id: item.id,
              title: item.title,
              content: <Text variant="body">{item.content}</Text>,
            }))}
            type="single"
            defaultOpen={[displayCopy.accordionItems[0]?.id ?? '1']}
          />
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{displayCopy.navigationTitle}</Heading>
          <Divider />
          <Breadcrumb
            items={displayCopy.breadcrumbs.map((item, index) => ({
              label: item.label,
              onClick: index < displayCopy.breadcrumbs.length - 1 ? () => {} : undefined,
            }))}
          />
        </Stack>
      </Card>
    </Stack>
  )
}
