import type { CssCategory } from '../../../css-classes/types'
import { buildAdvancedCssCategories } from './categories/advanced'
import { buildBaseCssCategories } from './categories/base'
import { buildExperimentalCssCategories } from './categories/experimental'

export const buildDefaultCssCategories = (): CssCategory[] => [
  ...buildBaseCssCategories(),
  ...buildAdvancedCssCategories(),
  ...buildExperimentalCssCategories(),
]
