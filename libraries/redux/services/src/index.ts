// Core API and HTTP utilities
export * from './api';

// Authentication
export * from './authService';

// Project services
export * from './projectService';
export * from './workspaceService';
export * from './templateService';

// Storage services
export * from './storageService';
export * from './indexedDBService';

// Utilities
export * from './utils';
export * from './rateLimiter';

// Types
export type {
  Project,
  ProjectCanvasItem,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateCanvasItemRequest,
  UpdateCanvasItemRequest,
  BulkUpdateCanvasItemsRequest
} from '../types/project';

export type {
  ProjectTemplate,
  TemplateCategory,
  TemplateFilters,
  TemplateCategoryInfo,
  TemplateWorkflow,
  CreateProjectFromTemplateRequest,
  TemplateStats
} from '../types/template';
