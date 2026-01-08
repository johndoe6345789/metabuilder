/**
 * This file has been refactored into modular lambda-per-file structure.
 *
 * Import individual functions or use the class wrapper:
 * @example
 * import { createTenant } from './dbal-integration'
 *
 * @example
 * import { DbalIntegrationUtils } from './dbal-integration'
 * DbalIntegrationUtils.createTenant(...)
 */

export * from './dbal-integration/index'
