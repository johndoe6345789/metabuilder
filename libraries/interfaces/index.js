/**
 * Shared Interfaces
 *
 * Service contracts and request/response interfaces used across MetaBuilder.
 *
 * Usage:
 *   import type { CreateProjectRequest } from '@metabuilder/interfaces';
 */
// Request/Response interfaces
export * from './requests';
// Re-export types for convenience (types are data shapes, interfaces are contracts)
export * from '../types/workflow';
export * from '../types/project';
