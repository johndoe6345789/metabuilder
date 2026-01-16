/**
 * @file is-plain-object.ts
 * @description Check if value is a plain object
 */

import { isPlainObject as isPlainObjectPredicate } from './predicates/is-plain-object'

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  isPlainObjectPredicate(value)
