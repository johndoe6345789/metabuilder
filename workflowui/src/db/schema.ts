/**
 * IndexedDB Schema using Dexie
 * Offline-first storage for workflows and execution history
 */

import Dexie, { Table } from 'dexie';
import { Workflow, ExecutionResult, NodeType } from '../types/workflow';

/**
 * Project types for TypeScript
 */
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tenantId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  tenantId: string;
  color?: string;
  starred?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectCanvasItem {
  id: string;
  projectId: string;
  workflowId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  color?: string;
  minimized?: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * WorkflowDB - IndexedDB database for WorkflowUI
 *
 * Tables:
 * - workflows: Stored workflow definitions
 * - executions: Execution history
 * - nodeTypes: Node registry cache
 * - drafts: Unsaved workflow drafts
 * - syncQueue: Changes pending sync to server
 * - workspaces: Workspace containers
 * - projects: Projects within workspaces
 * - projectCanvasItems: Workflow cards on canvas
 */
export class WorkflowDB extends Dexie {
  workflows!: Table<Workflow>;
  executions!: Table<ExecutionResult>;
  nodeTypes!: Table<NodeType>;
  drafts!: Table<Partial<Workflow>>;
  syncQueue!: Table<SyncQueueItem>;
  workspaces!: Table<Workspace>;
  projects!: Table<Project>;
  projectCanvasItems!: Table<ProjectCanvasItem>;

  constructor() {
    super('WorkflowUI');
    this.version(2).stores({
      workflows: 'id, tenantId, projectId, workspaceId, [tenantId+name], [tenantId+projectId], starred',
      executions: 'id, workflowId, [tenantId+workflowId]',
      nodeTypes: 'id, [tenantId+category]',
      drafts: 'id, tenantId',
      syncQueue: '++id, [tenantId+action]',
      workspaces: 'id, tenantId',
      projects: 'id, workspaceId, tenantId, [tenantId+workspaceId], starred',
      projectCanvasItems: 'id, projectId, workflowId, [projectId+workflowId]'
    });
  }
}

/**
 * Sync queue item for offline changes
 */
export interface SyncQueueItem {
  id?: number;
  tenantId: string;
  action: 'create' | 'update' | 'delete';
  entity: 'workflow' | 'execution';
  entityId: string;
  data?: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

// Create database instance
export const db = new WorkflowDB();

/**
 * Workflow operations
 */
export const workflowDB = {
  /**
   * Get all workflows for tenant
   */
  async getByTenant(tenantId: string): Promise<Workflow[]> {
    return db.workflows.where('tenantId').equals(tenantId).toArray();
  },

  /**
   * Get single workflow
   */
  async get(id: string): Promise<Workflow | undefined> {
    return db.workflows.get(id);
  },

  /**
   * Create workflow
   */
  async create(workflow: Workflow): Promise<string> {
    const id = await db.workflows.add(workflow);
    await addToSyncQueue({
      tenantId: workflow.tenantId,
      action: 'create',
      entity: 'workflow',
      entityId: workflow.id,
      data: workflow
    });
    return id as string;
  },

  /**
   * Update workflow
   */
  async update(workflow: Workflow): Promise<void> {
    await db.workflows.put(workflow);
    await addToSyncQueue({
      tenantId: workflow.tenantId,
      action: 'update',
      entity: 'workflow',
      entityId: workflow.id,
      data: workflow
    });
  },

  /**
   * Delete workflow
   */
  async delete(id: string, tenantId: string): Promise<void> {
    await db.workflows.delete(id);
    await addToSyncQueue({
      tenantId,
      action: 'delete',
      entity: 'workflow',
      entityId: id
    });
  },

  /**
   * Search workflows
   */
  async search(tenantId: string, query: string): Promise<Workflow[]> {
    const workflows = await db.workflows.where('tenantId').equals(tenantId).toArray();
    return workflows.filter(
      (w) => w.name.toLowerCase().includes(query.toLowerCase()) ||
             w.description?.toLowerCase().includes(query.toLowerCase())
    );
  },

  /**
   * Get draft for workflow
   */
  async getDraft(workflowId: string): Promise<Partial<Workflow> | undefined> {
    return db.drafts.get(workflowId);
  },

  /**
   * Save draft
   */
  async saveDraft(workflowId: string, draft: Partial<Workflow>): Promise<void> {
    await db.drafts.put({ ...draft, id: workflowId });
  },

  /**
   * Clear draft
   */
  async clearDraft(workflowId: string): Promise<void> {
    await db.drafts.delete(workflowId);
  }
};

/**
 * Execution operations
 */
export const executionDB = {
  /**
   * Get execution history for workflow
   */
  async getByWorkflow(
    workflowId: string,
    limit: number = 50
  ): Promise<ExecutionResult[]> {
    return db.executions
      .where('workflowId')
      .equals(workflowId)
      .reverse()
      .limit(limit)
      .toArray();
  },

  /**
   * Get single execution
   */
  async get(id: string): Promise<ExecutionResult | undefined> {
    return db.executions.get(id);
  },

  /**
   * Create execution record
   */
  async create(execution: ExecutionResult): Promise<string> {
    const id = await db.executions.add(execution);
    await addToSyncQueue({
      tenantId: execution.tenantId,
      action: 'create',
      entity: 'execution',
      entityId: execution.id,
      data: execution
    });
    return id as string;
  },

  /**
   * Update execution record
   */
  async update(execution: ExecutionResult): Promise<void> {
    await db.executions.put(execution);
  },

  /**
   * Get execution count for workflow
   */
  async countByWorkflow(workflowId: string): Promise<number> {
    return db.executions.where('workflowId').equals(workflowId).count();
  },

  /**
   * Get average execution time
   */
  async getAverageTime(workflowId: string): Promise<number> {
    const executions = await db.executions.where('workflowId').equals(workflowId).toArray();
    if (executions.length === 0) return 0;
    const total = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
    return total / executions.length;
  },

  /**
   * Clear old executions
   */
  async clearOlderThan(days: number): Promise<void> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    await db.executions.where('startTime').below(cutoff).delete();
  }
};

/**
 * Node type cache operations
 */
export const nodeTypeDB = {
  /**
   * Get all node types for tenant
   */
  async getByTenant(tenantId: string): Promise<NodeType[]> {
    return db.nodeTypes.where('tenantId').equals(tenantId).toArray();
  },

  /**
   * Get node types by category
   */
  async getByCategory(tenantId: string, category: string): Promise<NodeType[]> {
    return db.nodeTypes
      .where('[tenantId+category]')
      .equals([tenantId, category])
      .toArray();
  },

  /**
   * Cache node types
   */
  async cache(tenantId: string, nodeTypes: NodeType[]): Promise<void> {
    await db.nodeTypes.bulkPut(
      nodeTypes.map((nt) => ({ ...nt, tenantId }))
    );
  },

  /**
   * Clear cache for tenant
   */
  async clearCache(tenantId: string): Promise<void> {
    await db.nodeTypes.where('tenantId').equals(tenantId).delete();
  }
};

/**
 * Sync queue operations
 */
export const syncQueueDB = {
  /**
   * Add item to sync queue
   */
  async add(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<number> {
    return db.syncQueue.add({
      ...item,
      timestamp: Date.now(),
      retries: 0
    }) as Promise<number>;
  },

  /**
   * Get pending items for tenant
   */
  async getPending(tenantId: string): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('tenantId').equals(tenantId).toArray();
  },

  /**
   * Mark as synced
   */
  async markSynced(id: number): Promise<void> {
    await db.syncQueue.delete(id);
  },

  /**
   * Increment retry count
   */
  async incrementRetry(id: number, error: string): Promise<void> {
    const item = await db.syncQueue.get(id);
    if (item) {
      await db.syncQueue.update(id, {
        retries: item.retries + 1,
        lastError: error
      });
    }
  },

  /**
   * Clear old items
   */
  async clearOlderThan(days: number): Promise<void> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    await db.syncQueue.where('timestamp').below(cutoff).delete();
  }
};

/**
 * Helper to add item to sync queue
 */
async function addToSyncQueue(
  item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>
): Promise<void> {
  try {
    await syncQueueDB.add(item);
  } catch (error) {
    console.error('Failed to add to sync queue:', error);
  }
}

/**
 * Workspace operations
 */
export const workspaceDB = {
  /**
   * Get all workspaces for tenant
   */
  async getByTenant(tenantId: string): Promise<Workspace[]> {
    return db.workspaces.where('tenantId').equals(tenantId).toArray();
  },

  /**
   * Get single workspace
   */
  async get(id: string): Promise<Workspace | undefined> {
    return db.workspaces.get(id);
  },

  /**
   * Create workspace
   */
  async create(workspace: Workspace): Promise<string> {
    const id = await db.workspaces.add(workspace);
    return id as string;
  },

  /**
   * Update workspace
   */
  async update(workspace: Workspace): Promise<void> {
    await db.workspaces.put(workspace);
  },

  /**
   * Delete workspace
   */
  async delete(id: string): Promise<void> {
    await db.workspaces.delete(id);
  }
};

/**
 * Project operations
 */
export const projectDB = {
  /**
   * Get all projects for workspace
   */
  async getByWorkspace(workspaceId: string): Promise<Project[]> {
    return db.projects.where('workspaceId').equals(workspaceId).toArray();
  },

  /**
   * Get all projects for tenant
   */
  async getByTenant(tenantId: string): Promise<Project[]> {
    return db.projects.where('tenantId').equals(tenantId).toArray();
  },

  /**
   * Get single project
   */
  async get(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  /**
   * Create project
   */
  async create(project: Project): Promise<string> {
    const id = await db.projects.add(project);
    return id as string;
  },

  /**
   * Update project
   */
  async update(project: Project): Promise<void> {
    await db.projects.put(project);
  },

  /**
   * Delete project
   */
  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  },

  /**
   * Get starred projects for tenant
   */
  async getStarred(tenantId: string): Promise<Project[]> {
    return db.projects
      .where('tenantId')
      .equals(tenantId)
      .filter((p) => p.starred === true)
      .toArray();
  }
};

/**
 * Project canvas item operations
 */
export const projectCanvasItemDB = {
  /**
   * Get all canvas items for project
   */
  async getByProject(projectId: string): Promise<ProjectCanvasItem[]> {
    return db.projectCanvasItems.where('projectId').equals(projectId).toArray();
  },

  /**
   * Get single canvas item
   */
  async get(id: string): Promise<ProjectCanvasItem | undefined> {
    return db.projectCanvasItems.get(id);
  },

  /**
   * Create canvas item
   */
  async create(item: ProjectCanvasItem): Promise<string> {
    const id = await db.projectCanvasItems.add(item);
    return id as string;
  },

  /**
   * Update canvas item
   */
  async update(item: ProjectCanvasItem): Promise<void> {
    await db.projectCanvasItems.put(item);
  },

  /**
   * Delete canvas item
   */
  async delete(id: string): Promise<void> {
    await db.projectCanvasItems.delete(id);
  },

  /**
   * Bulk update canvas items
   */
  async bulkUpdate(items: ProjectCanvasItem[]): Promise<void> {
    await db.projectCanvasItems.bulkPut(items);
  },

  /**
   * Get canvas item by workflow ID
   */
  async getByWorkflow(projectId: string, workflowId: string): Promise<ProjectCanvasItem | undefined> {
    return db.projectCanvasItems
      .where('[projectId+workflowId]')
      .equals([projectId, workflowId])
      .first();
  },

  /**
   * Delete all items for project
   */
  async deleteByProject(projectId: string): Promise<void> {
    await db.projectCanvasItems.where('projectId').equals(projectId).delete();
  }
};

export default db;
