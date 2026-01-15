/**
 * @file is-valid-uuid.ts
 * @description Validate UUID format
 */

import { isValidUuid as isValidUuidPredicate } from './predicates/is-valid-uuid'

export const isValidUuid = (id: string): boolean => isValidUuidPredicate(id)
