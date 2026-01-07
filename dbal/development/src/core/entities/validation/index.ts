/**
 * @file index.ts
 * @description Barrel export for validation functions
 *
 * Re-exports validation functions from foundation to provide a convenient
 * import path for validation functions used throughout the entities operations modules.
 */

// Re-export all validation functions from foundation
export { isValidEmail } from '../../foundation/validation'
export { isValidDate } from '../../foundation/validation'
export { isValidUsername } from '../../foundation/validation'
export { isValidSlug } from '../../foundation/validation'
export { isValidSemver } from '../../foundation/validation'
export { isValidTitle } from '../../foundation/validation'
export { isValidLevel } from '../../foundation/validation'
export { isValidUuid } from '../../foundation/validation'
export { isPlainObject } from '../../foundation/validation'
export { validateUserCreate } from '../../foundation/validation'
export { validateUserUpdate } from '../../foundation/validation'
export { validateCredentialCreate } from '../../foundation/validation'
export { validateCredentialUpdate } from '../../foundation/validation'
export { validateSessionCreate } from '../../foundation/validation'
export { validateSessionUpdate } from '../../foundation/validation'
export { validatePageCreate } from '../../foundation/validation'
export { validatePageUpdate } from '../../foundation/validation'
export { validateComponentHierarchyCreate } from '../../foundation/validation'
export { validateComponentHierarchyUpdate } from '../../foundation/validation'
export { validateWorkflowCreate } from '../../foundation/validation'
export { validateWorkflowUpdate } from '../../foundation/validation'
export { validatePackageCreate } from '../../foundation/validation'
export { validatePackageUpdate } from '../../foundation/validation'
export { validateId } from '../../foundation/validation'

// Local validators (kept for backward compatibility if needed)
export { validateEmail, validateUsername } from './validators/user-validation';
export { validateSlug } from './validators/page-validation';
export { validateWorkflowType } from './validators/workflow-validation';
export { validatePackageId, validateVersion } from './validators/package-validation';
