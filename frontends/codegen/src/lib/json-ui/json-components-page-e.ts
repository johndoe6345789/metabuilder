/**
 * Page components Q–T: quickseed, responsive, sass, search, sections,
 * spacer, stack, status, step, template, tips.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  QuickSeedButtonProps, ResponsiveGridProps,
  SassStylesShowcaseProps, SearchEmptyStateProps,
  SearchInputProps, SearchResultsProps, SectionProps,
  SpacerProps, StackProps, StatusCardProps,
  StepIndicatorProps, StepperProps, TemplateExplorerProps,
  TipsCardProps,
} from './interfaces'
import quickSeedButtonDef from
  '@/components/json-definitions/quick-seed-button.json'
import responsiveGridDef from
  '@/components/json-definitions/responsive-grid.json'
import sassStylesShowcaseDef from
  '@/components/json-definitions/sass-styles-showcase.json'
import searchEmptyStateDef from
  '@/components/json-definitions/search-empty-state.json'
import searchInputDef from
  '@/components/json-definitions/search-input.json'
import searchResultsDef from
  '@/components/json-definitions/search-results.json'
import sectionDef from '@/components/json-definitions/section.json'
import spacerDef from '@/components/json-definitions/spacer.json'
import stackDef from '@/components/json-definitions/stack.json'
import statusCardDef from
  '@/components/json-definitions/status-card.json'
import stepIndicatorDef from
  '@/components/json-definitions/step-indicator.json'
import stepperDef from '@/components/json-definitions/stepper.json'
import templateExplorerDef from
  '@/components/json-definitions/template-explorer.json'
import tipsCardDef from
  '@/components/json-definitions/tips-card.json'

export const MetabuilderWidgetQuickSeedButton =
  createJsonComponentWithHooks<QuickSeedButtonProps>(
    quickSeedButtonDef,
    { hooks: { hookData: {
      hookName: 'useQuickSeed', args: () => [],
    } } },
  )
export const MetabuilderLayoutResponsiveGrid =
  createJsonComponent<ResponsiveGridProps>(responsiveGridDef)
export const MetabuilderWidgetSassStylesShowcase =
  createJsonComponent<SassStylesShowcaseProps>(
    sassStylesShowcaseDef,
  )
export const MetabuilderWidgetSearchEmptyState =
  createJsonComponent<SearchEmptyStateProps>(searchEmptyStateDef)
export const MetabuilderWidgetSearchInput =
  createJsonComponent<SearchInputProps>(searchInputDef)
export const MetabuilderWidgetSearchResults =
  createJsonComponent<SearchResultsProps>(searchResultsDef)
export const MetabuilderLayoutSection =
  createJsonComponent<SectionProps>(sectionDef)
export const MetabuilderWidgetSpacer =
  createJsonComponent<SpacerProps>(spacerDef)
export const MetabuilderLayoutStack =
  createJsonComponent<StackProps>(stackDef)
export const MetabuilderWidgetStatusCard =
  createJsonComponent<StatusCardProps>(statusCardDef)
export const MetabuilderWidgetStepIndicator =
  createJsonComponent<StepIndicatorProps>(stepIndicatorDef)
export const MetabuilderWidgetStepper =
  createJsonComponent<StepperProps>(stepperDef)
export const MetabuilderWidgetTemplateExplorer =
  createJsonComponent<TemplateExplorerProps>(templateExplorerDef)
export const MetabuilderLayoutTipsCard =
  createJsonComponent<TipsCardProps>(tipsCardDef)
