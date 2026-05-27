/**
 * Utility components A–D: binding, chip, code, conditional, copy, data.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  BindingIndicatorProps, ChipProps, CircularProgressProps,
  CodeProps, ConditionalWrapperProps, CopyButtonProps,
  DataCardProps, DynamicTextProps,
} from './interfaces'
import bindingIndicatorDef from
  '@/components/json-definitions/binding-indicator.json'
import chipDef from '@/components/json-definitions/chip.json'
import circularProgressDef from
  '@/components/json-definitions/circular-progress.json'
import codeDef from '@/components/json-definitions/code.json'
import conditionalWrapperDef from
  '@/components/json-definitions/conditional-wrapper.json'
import copyButtonDef from
  '@/components/json-definitions/copy-button.json'
import dataCardDef from
  '@/components/json-definitions/data-card.json'
import dynamicTextDef from
  '@/components/json-definitions/dynamic-text.json'

export const MetabuilderWidgetBindingIndicator =
  createJsonComponent<BindingIndicatorProps>(bindingIndicatorDef)
export const MetabuilderWidgetChip =
  createJsonComponent<ChipProps>(chipDef)
export const MetabuilderDisplayCircularProgress =
  createJsonComponent<CircularProgressProps>(circularProgressDef)
export const MetabuilderDisplayCode =
  createJsonComponent<CodeProps>(codeDef)
export const MetabuilderLayoutConditionalWrapper =
  createJsonComponent<ConditionalWrapperProps>(
    conditionalWrapperDef,
  )
export const MetabuilderFormCopyButton =
  createJsonComponentWithHooks<CopyButtonProps>(copyButtonDef, {
    hooks: { copyState: {
      hookName: 'useCopyState', args: (p) => [p.text],
    } },
  })
export const MetabuilderLayoutDataCard =
  createJsonComponent<DataCardProps>(dataCardDef)
export const MetabuilderDisplayDynamicText =
  createJsonComponentWithHooks<DynamicTextProps>(
    dynamicTextDef,
    { hooks: { formattedValue: {
      hookName: 'useFormatValue',
      args: (p) => [p.value, p.format, p.currency, p.locale],
    } } },
  )
