/**
 * @file index.ts
 * @description Main barrel export for all entity operations
 */

// Atomic entity modules
export * as user from './user';
export * as page from './page';
export * as workflow from './workflow';
export * as session from './session';
export * as luaScript from './lua-script';
export * as pkg from './package';

// Legacy factory exports (for backward compatibility)
export { createUserOperations } from './user-operations';
export { createPageOperations } from './page-operations';
export { createComponentOperations } from './component-operations';
export { createWorkflowOperations } from './workflow-operations';
export { createLuaScriptOperations } from './lua-script-operations';
export { createPackageOperations } from './package-operations';
export { createSessionOperations } from './session-operations';

// Validation utilities
export * from './validation';
