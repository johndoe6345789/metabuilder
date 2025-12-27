/**
 * @file lua-examples-data.ts
 * @description Aggregated Lua examples for the editor
 * 
 * This file imports and re-exports examples from organized categories.
 * Each category is in its own file for better maintainability.
 */

import { basicExamples } from './categories/basic-examples'
import { dataExamples } from './categories/data-examples'
import { validationExamples } from './categories/validation-examples'

export const LUA_EXAMPLES = {
  ...basicExamples,
  ...dataExamples,
  ...validationExamples,
}
