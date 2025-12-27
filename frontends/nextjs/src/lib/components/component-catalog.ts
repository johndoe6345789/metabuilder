import type { ComponentDefinition } from './types'
import { dataComponents } from './catalog/data'
import { displayComponents } from './catalog/display'
import { feedbackComponents } from './catalog/feedback'
import { inputComponents } from './catalog/inputs'
import { layoutComponents } from './catalog/layout'
import { typographyComponents } from './catalog/typography'

export const componentCatalog: ComponentDefinition[] = [
  ...layoutComponents,
  ...displayComponents,
  ...inputComponents,
  ...typographyComponents,
  ...feedbackComponents,
  ...dataComponents,
]
