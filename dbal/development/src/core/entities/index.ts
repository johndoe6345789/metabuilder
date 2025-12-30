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
// TODO: Implement these operation factory functions
// export { createUserOperations } from './operations/core/user-operations';
// export { createPageOperations } from './operations/system/page-operations';
// export { createComponentOperations } from './operations/system/component-operations';
// export { createWorkflowOperations } from './operations/core/workflow-operations';
// export { createLuaScriptOperations } from './operations/core/lua-script-operations';
// export { createPackageOperations } from './operations/system/package-operations';
// export { createSessionOperations } from './operations/core/session-operations';

// Temporary stubs for operation factories
export const createUserOperations = (...args: any[]): any => {
  throw new Error('User operations factory not yet implemented');
};
export const createPageOperations = (...args: any[]): any => {
  throw new Error('Page operations factory not yet implemented');
};
export const createComponentOperations = (...args: any[]): any => {
  throw new Error('Component operations factory not yet implemented');
};
export const createWorkflowOperations = (...args: any[]): any => {
  throw new Error('Workflow operations factory not yet implemented');
};
export const createLuaScriptOperations = (...args: any[]): any => {
  throw new Error('Lua script operations factory not yet implemented');
};
export const createPackageOperations = (...args: any[]): any => {
  throw new Error('Package operations factory not yet implemented');
};
export const createSessionOperations = (...args: any[]): any => {
  throw new Error('Session operations factory not yet implemented');
};

// Validation utilities
export * from '../validation';
