/**
 * Workflow Service
 * Business logic layer for workflow operations with offline-first capabilities
 */

import { Workflow, WorkflowNode, WorkflowConnection } from '../types/workflow';
import { api } from './api';
import { db, workflowDB } from '../db/schema';

/**
 * Workflow service with offline-first support
 */
export const workflowService = {
  /**
   * Create a new workflow locally
   */
  async createWorkflow(data: {
    name: string;
    description?: string;
    tenantId: string;
  }): Promise<Workflow> {
    const now = Date.now();
    const workflow: Workflow = {
      id: `workflow-${now}`,
      name: data.name,
      description: data.description || '',
      version: '1.0.0',
      tenantId: data.tenantId,
      nodes: [],
      connections: [],
      tags: [],
      createdAt: now,
      updatedAt: now
    };

    // Save to IndexedDB
    await db.workflows.add(workflow);

    // Add to sync queue for backend sync
    await db.syncQueue.add({
      id: undefined,
      tenantId: data.tenantId,
      action: 'create',
      entity: 'workflow',
      entityId: workflow.id,
      data: workflow,
      timestamp: now,
      retries: 0
    });

    return workflow;
  },

  /**
   * Get workflow from IndexedDB or backend
   */
  async getWorkflow(workflowId: string, tenantId: string): Promise<Workflow | undefined> {
    try {
      // Try IndexedDB first
      return await db.workflows.get(workflowId);
    } catch {
      // Fall through to backend
      return undefined;
    }
  },

  /**
   * Fetch workflow from backend
   */
  async fetchFromBackend(workflowId: string, tenantId: string): Promise<Workflow> {
    const workflow = await api.workflows.get(workflowId);

    // Cache in IndexedDB
    await db.workflows.put(workflow);

    return workflow;
  },

  /**
   * Save workflow to IndexedDB
   */
  async saveWorkflow(workflow: Workflow): Promise<void> {
    workflow.updatedAt = Date.now();
    await db.workflows.put(workflow);

    // Add to sync queue
    await db.syncQueue.add({
      id: undefined,
      tenantId: workflow.tenantId,
      action: 'update',
      entity: 'workflow',
      entityId: workflow.id,
      data: workflow,
      timestamp: Date.now(),
      retries: 0
    });
  },

  /**
   * Sync workflow to backend
   */
  async syncToBackend(workflow: Workflow): Promise<Workflow> {
    if (workflow.id.startsWith('workflow-')) {
      // New workflow - create on backend
      const result = await api.workflows.create(workflow);
      await db.workflows.put(result);
      return result;
    } else {
      // Existing workflow - update on backend
      const result = await api.workflows.update(workflow.id, workflow);
      await db.workflows.put(result);

      // Mark sync queue item as synced
      const syncItems = await db.syncQueue
        .where('[tenantId+action]')
        .equals([workflow.tenantId, 'update'])
        .toArray();

      for (const item of syncItems) {
        if (item.entityId === workflow.id) {
          await db.syncQueue.update(item.id, { retries: 0 });
        }
      }

      return result;
    }
  },

  /**
   * List workflows for tenant
   */
  async listWorkflows(tenantId: string): Promise<Workflow[]> {
    try {
      // Try backend first
      const response = await api.workflows.list(tenantId);
      const workflows = response.workflows || [];

      // Update IndexedDB cache
      await Promise.all(
        workflows.map((w: Workflow) => db.workflows.put(w))
      );

      return workflows;
    } catch {
      // Fall back to IndexedDB
      return db.workflows
        .where('tenantId')
        .equals(tenantId)
        .toArray();
    }
  },

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string, tenantId: string = 'default'): Promise<void> {
    // Delete from backend
    await api.workflows.delete(workflowId);

    // Remove from IndexedDB
    await db.workflows.delete(workflowId);

    // Add to sync queue for confirmation
    await db.syncQueue.add({
      id: undefined,
      tenantId,
      action: 'delete',
      entity: 'workflow',
      entityId: workflowId,
      data: null,
      timestamp: Date.now(),
      retries: 0
    });
  },

  /**
   * Validate workflow before execution
   */
  async validateWorkflow(workflowId: string, workflow: Workflow): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return api.workflows.validate(workflowId, {
      nodes: workflow.nodes,
      connections: workflow.connections
    });
  },

  /**
   * Export workflow to JSON
   */
  async exportWorkflow(workflow: Workflow): Promise<string> {
    return JSON.stringify(workflow, null, 2);
  },

  /**
   * Import workflow from JSON
   */
  async importWorkflow(
    json: string,
    tenantId: string
  ): Promise<Workflow> {
    try {
      const workflow: Workflow = JSON.parse(json);
      workflow.id = `workflow-${Date.now()}`;
      workflow.tenantId = tenantId;
      workflow.createdAt = Date.now();
      workflow.updatedAt = Date.now();

      await db.workflows.add(workflow);
      return workflow;
    } catch (error) {
      throw new Error('Invalid workflow JSON format');
    }
  },

  /**
   * Duplicate workflow
   */
  async duplicateWorkflow(workflowId: string, newName: string): Promise<Workflow> {
    const original = await db.workflows.get(workflowId);

    if (!original) {
      throw new Error('Workflow not found');
    }

    const duplicate: Workflow = {
      ...original,
      id: `workflow-${Date.now()}`,
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.workflows.add(duplicate);
    return duplicate;
  },

  /**
   * Get workflow node count and complexity metrics
   */
  async getWorkflowMetrics(workflow: Workflow): Promise<{
    nodeCount: number;
    connectionCount: number;
    complexity: 'simple' | 'moderate' | 'complex';
    depth: number;
  }> {
    const nodeCount = workflow.nodes.length;
    const connectionCount = workflow.connections.length;

    // Calculate depth (longest path through DAG)
    let depth = 0;
    const visited = new Set<string>();
    const stack: [string, number][] = [];

    // Find source nodes (no incoming connections)
    const hasIncoming = new Set(workflow.connections.map((c) => c.target));
    const sourceNodes = workflow.nodes.filter((n) => !hasIncoming.has(n.id));

    // DFS to find maximum depth
    for (const node of sourceNodes) {
      stack.push([node.id, 1]);
    }

    while (stack.length > 0) {
      const [nodeId, currentDepth] = stack.pop()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      depth = Math.max(depth, currentDepth);

      // Find children
      const children = workflow.connections
        .filter((c) => c.source === nodeId)
        .map((c) => c.target);

      for (const child of children) {
        stack.push([child, currentDepth + 1]);
      }
    }

    // Determine complexity based on node and connection counts
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (nodeCount > 5 || connectionCount > 8) {
      complexity = 'complex';
    } else if (nodeCount > 3 || connectionCount > 4) {
      complexity = 'moderate';
    }

    return { nodeCount, connectionCount, complexity, depth };
  }
};
