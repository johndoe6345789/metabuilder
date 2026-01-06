/**
 * @file types.ts
 * @description Type definitions for workflow operations (stub)
 */

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  definition?: any;
  isActive?: boolean;
  trigger?: string;
  triggerConfig?: any;
  steps?: any[];
  createdBy?: string;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  definition?: any;
  isActive?: boolean;
  trigger?: string;
  triggerConfig?: any;
  steps?: any[];
  createdBy?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  definition?: any;
  isActive?: boolean;
  trigger?: string;
  triggerConfig?: any;
  steps?: any[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowView {
  id: string;
  name: string;
  description?: string;
  definition?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ListOptions {
  filter?: Record<string, any>;
  sort?: Record<string, 'asc' | 'desc'>;
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface ListResult<T> {
  items?: T[];
  data?: T[];
  total: number;
  skip?: number;
  take?: number;
}
