import {
  DatePicker,
  Heading,
  RangeSlider,
  Rating,
  ResponsiveGrid,
  Section,
  Separator,
  Spacer,
  Switch,
  Text,
} from '@/components/atoms'
import { FilterInput } from '@/lib/json-ui/json-components'

type FormControlsSectionContent =
  (typeof import('@/data/atomic-library-showcase.json'))['sections']['formControls']

interface FormControlsSectionProps {
  content: FormControlsSectionContent
  switchChecked: boolean
  onSwitchChange: (value: boolean) => void
  selectedDate: Date | undefined
  onDateChange: (value: Date | undefined) => void
  filterValue: string
  onFilterChange: (value: string) => void
  rating: number
  onRatingChange: (value: number) => void
  rangeValue: [number, number]
  onRangeChange: (value: [number, number]) => void
}

export function FormControlsSection({
  content,
  switchChecked,
  onSwitchChange,
  selectedDate,
  onDateChange,
  filterValue,
  onFilterChange,
  rating,
  onRatingChange,
  rangeValue,
  onRangeChange,
}: FormControlsSectionProps) {
  return (
    <Section spacing="lg">
      <Heading level={2}>{content.title}</Heading>
      <Separator />
      <ResponsiveGrid columns={2} gap="lg">
        <div>
          <Text variant="muted" className="mb-2">
            {content.switchLabel}
          </Text>
          <Switch
            checked={switchChecked}
            onCheckedChange={onSwitchChange}
            label={content.switch.label}
            description={content.switch.description}
          />
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.datePickerLabel}
          </Text>
          <DatePicker value={selectedDate} onChange={onDateChange} placeholder={content.datePlaceholder} />
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.filterInputLabel}
          </Text>
          <FilterInput value={filterValue} onChange={onFilterChange} placeholder={content.filterPlaceholder} />
        </div>

        <div>
          <Text variant="muted" className="mb-2">
            {content.ratingLabel}
          </Text>
          <Rating value={rating} onChange={onRatingChange} />
        </div>
      </ResponsiveGrid>

      <Spacer size="md" axis="vertical" />

      <div>
        <Text variant="muted" className="mb-2">
          {content.rangeSliderLabel}
        </Text>
        <RangeSlider value={rangeValue} onChange={onRangeChange} label={content.rangeSlider.label} showValue />
      </div>
    </Section>
  )
}
