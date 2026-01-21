import { useState } from 'react'
import { Container, Stack } from '@/components/atoms'
import { PageHeader } from '@/lib/json-ui/json-components'
import data from '@/data/atomic-library-showcase.json'
import { AvatarsUserElementsSection } from '@/components/atomic-library/AvatarsUserElementsSection'
import { BadgesIndicatorsSection } from '@/components/atomic-library/BadgesIndicatorsSection'
import { ButtonsActionsSection } from '@/components/atomic-library/ButtonsActionsSection'
import { CardsMetricsSection } from '@/components/atomic-library/CardsMetricsSection'
import { EnhancedComponentsSection } from '@/components/atomic-library/EnhancedComponentsSection'
import { FeedbackSection } from '@/components/atomic-library/FeedbackSection'
import { FormControlsSection } from '@/components/atomic-library/FormControlsSection'
import { InteractiveElementsSection } from '@/components/atomic-library/InteractiveElementsSection'
import { LayoutComponentsSection } from '@/components/atomic-library/LayoutComponentsSection'
import { ProgressLoadingSection } from '@/components/atomic-library/ProgressLoadingSection'
import { SummarySection } from '@/components/atomic-library/SummarySection'
import { TypographySection } from '@/components/atomic-library/TypographySection'

export function AtomicLibraryShowcase() {
  const [switchChecked, setSwitchChecked] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80])
  const [filterValue, setFilterValue] = useState('')
  const [rating, setRating] = useState(3)
  const [numberValue, setNumberValue] = useState(10)

  const { pageHeader, sections } = data

  return (
    <Container size="xl" className="py-8">
      <PageHeader title={pageHeader.title} description={pageHeader.description} />

      <Stack direction="vertical" spacing="xl">
        <ButtonsActionsSection content={sections.buttonsActions} />
        <BadgesIndicatorsSection content={sections.badgesIndicators} />
        <TypographySection content={sections.typography} />
        <FormControlsSection
          content={sections.formControls}
          switchChecked={switchChecked}
          onSwitchChange={setSwitchChecked}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          filterValue={filterValue}
          onFilterChange={setFilterValue}
          rating={rating}
          onRatingChange={setRating}
          rangeValue={rangeValue}
          onRangeChange={setRangeValue}
        />
        <ProgressLoadingSection content={sections.progressLoading} />
        <FeedbackSection content={sections.feedback} />
        <AvatarsUserElementsSection content={sections.avatarsUserElements} />
        <CardsMetricsSection content={sections.cardsMetrics} />
        <InteractiveElementsSection content={sections.interactiveElements} />
        <LayoutComponentsSection content={sections.layoutComponents} />
        <EnhancedComponentsSection
          content={sections.enhancedComponents}
          numberValue={numberValue}
          onNumberChange={setNumberValue}
        />
        <SummarySection content={sections.summary} />
      </Stack>
    </Container>
  )
}
