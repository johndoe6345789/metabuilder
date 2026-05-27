/**
 * Atomic library sub-components for component registry.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from 'react'
import type { UIComponentRegistry } from './component-registry-types'
import { ButtonsActionsSection } from
  '@/components/atomic-library/ButtonsActionsSection'
import { BadgesIndicatorsSection } from
  '@/components/atomic-library/BadgesIndicatorsSection'
import { TypographySection } from
  '@/components/atomic-library/TypographySection'
import { FormControlsSection } from
  '@/components/atomic-library/FormControlsSection'
import { ProgressLoadingSection } from
  '@/components/atomic-library/ProgressLoadingSection'
import { FeedbackSection } from
  '@/components/atomic-library/FeedbackSection'
import { AvatarsUserElementsSection } from
  '@/components/atomic-library/AvatarsUserElementsSection'
import { CardsMetricsSection } from
  '@/components/atomic-library/CardsMetricsSection'
import { InteractiveElementsSection } from
  '@/components/atomic-library/InteractiveElementsSection'
import { LayoutComponentsSection } from
  '@/components/atomic-library/LayoutComponentsSection'
import { EnhancedComponentsSection } from
  '@/components/atomic-library/EnhancedComponentsSection'
import { SummarySection } from
  '@/components/atomic-library/SummarySection'

const C = <T>(c: T) => c as unknown as ComponentType<any>

export const atomicLibrarySubComponents: UIComponentRegistry = {
  ButtonsActionsSection: C(ButtonsActionsSection),
  BadgesIndicatorsSection: C(BadgesIndicatorsSection),
  TypographySection: C(TypographySection),
  FormControlsSection: C(FormControlsSection),
  ProgressLoadingSection: C(ProgressLoadingSection),
  FeedbackSection: C(FeedbackSection),
  AvatarsUserElementsSection: C(AvatarsUserElementsSection),
  CardsMetricsSection: C(CardsMetricsSection),
  InteractiveElementsSection: C(InteractiveElementsSection),
  LayoutComponentsSection: C(LayoutComponentsSection),
  EnhancedComponentsSection: C(EnhancedComponentsSection),
  SummarySection: C(SummarySection),
}
