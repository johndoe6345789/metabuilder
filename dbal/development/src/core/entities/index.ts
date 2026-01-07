/**
 * @file index.ts
 * @description Main barrel export for all entity operations
 * NOTE: Some operation factories are not yet implemented - stubbed for build
 */

// Atomic entity modules
export * as user from './user';
export * as page from './page';
export * as workflow from './workflow';
export * as session from './session';
export * as luaScript from './lua-script';
export * as pkg from './package';

// Legacy factory exports (for backward compatibility)
export { createUserOperations } from './operations/core/user-operations';
export { createPageOperations } from './operations/system/page-operations';
export { createComponentOperations } from './operations/system/component-operations';
export { createWorkflowOperations } from './operations/core/workflow-operations';
export { createLuaScriptOperations } from './operations/core/lua-script-operations';
export { createPackageOperations } from './operations/system/package-operations';
export { createSessionOperations } from './operations/core/session-operations';

// Validation utilities
export * from '../validation';
