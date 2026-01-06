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
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  definition?: any;
  isActive?: boolean;
  trigger?: string;
  triggerConfig?: any;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  definition?: any;
  isActive: boolean;
  trigger?: string;
  triggerConfig?: any;
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
