import { ARRAY_OPERATION_SNIPPETS } from './array-operations'
import { CONDITIONAL_LOGIC_SNIPPETS } from './conditionals-and-logic'
import { DATA_TRANSFORMATION_SNIPPETS } from './data-transformation'
import { DATA_VALIDATION_SNIPPETS } from './data-validation'
import { DATE_AND_TIME_SNIPPETS } from './date-and-time'
import { ERROR_HANDLING_SNIPPETS } from './error-handling'
import { MATH_CALCULATION_SNIPPETS } from './math-calculations'
import { STRING_PROCESSING_SNIPPETS } from './string-processing'
import { USER_MANAGEMENT_SNIPPETS } from './user-management'
import { UTILITY_SNIPPETS } from './utilities'
import type { LuaSnippet } from './types'

export type { LuaSnippet } from './types'

export const LUA_SNIPPET_CATEGORIES = [
  'All',
  'Data Validation',
  'Data Transformation',
  'Array Operations',
  'String Processing',
  'Math & Calculations',
  'Conditionals & Logic',
  'User Management',
  'Error Handling',
  'API & Networking',
  'Date & Time',
  'File Operations',
  'Utilities',
] as const

export const LUA_SNIPPETS: LuaSnippet[] = [
  ...DATA_VALIDATION_SNIPPETS,
  ...DATA_TRANSFORMATION_SNIPPETS,
  ...ARRAY_OPERATION_SNIPPETS,
  ...STRING_PROCESSING_SNIPPETS,
  ...MATH_CALCULATION_SNIPPETS,
  ...CONDITIONAL_LOGIC_SNIPPETS,
  ...USER_MANAGEMENT_SNIPPETS,
  ...ERROR_HANDLING_SNIPPETS,
  ...DATE_AND_TIME_SNIPPETS,
  ...UTILITY_SNIPPETS,
]
