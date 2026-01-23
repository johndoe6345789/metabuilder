/**
 * Execution Service
 * Handles workflow execution with polling and result caching
 */

import { ExecutionResult, WorkflowNode, WorkflowConnection } from '@types/workflow';
import { api } from './api';
import { workflowDB } from '@db/schema';

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 300; // 10 minutes max

/**
 * Execution service for managing workflow runs
 */
export const executionService = {
  /**
   * Execute workflow and poll for results
   */
  async executeWorkflow(
    workflowId: string,
    workflow: {
      nodes: WorkflowNode[];
      connections: WorkflowConnection[];
    },
    tenantId: string = 'default'
  ): Promise<ExecutionResult> {
    // Start execution on backend
    const execution = await api.executions.execute(workflowId, workflow);

    // Save to IndexedDB
    await workflowDB.executions.add(execution);

    // Poll for completion
    return this.pollForCompletion(execution.id, workflowId, tenantId);
  },

  /**
   * Poll execution until completion
   */
  async pollForCompletion(
    executionId: string,
    workflowId: string,
    tenantId: string,
    attempts: number = 0
  ): Promise<ExecutionResult> {
    if (attempts > MAX_POLL_ATTEMPTS) {
      throw new Error('Execution timed out');
    }

    try {
      const execution = await api.executions.getById(executionId);

      // Save to IndexedDB
      await workflowDB.executions.put(execution);

      // Check if execution is complete
      if (
        execution.status === 'success' ||
        execution.status === 'error' ||
        execution.status === 'stopped'
      ) {
        return execution;
      }

      // Still running, poll again
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
      return this.pollForCompletion(executionId, workflowId, tenantId, attempts + 1);
    } catch (error) {
      throw new Error(`Failed to get execution status: ${error}`);
    }
  },

  /**
   * Get execution history for workflow
   */
  async getExecutionHistory(
    workflowId: string,
    tenantId: string,
    limit: number = 50
  ): Promise<ExecutionResult[]> {
    try {
      // Try backend first
      const response = await api.executions.getHistory(workflowId, limit);
      const executions = response.executions || [];

      // Update IndexedDB cache
      await Promise.all(
        executions.map((e: ExecutionResult) => workflowDB.executions.put(e))
      );

      return executions;
    } catch {
      // Fall back to IndexedDB
      return workflowDB.executions
        .where('[tenantId+workflowId]')
        .equals([tenantId, workflowId])
        .reverse()
        .limit(limit)
        .toArray();
    }
  },

  /**
   * Get specific execution
   */
  async getExecution(executionId: string): Promise<ExecutionResult | undefined> {
    try {
      // Try IndexedDB first
      return await workflowDB.executions.get(executionId);
    } catch {
      // Fall back to backend
      return api.executions.getById(executionId);
    }
  },

  /**
   * Get execution results with node details
   */
  async getExecutionDetails(executionId: string): Promise<{
    execution: ExecutionResult;
    nodeResults: Record<string, any>;
    summary: {
      totalNodes: number;
      successNodes: number;
      failedNodes: number;
      skippedNodes: number;
      duration: number;
    };
  }> {
    const execution = await this.getExecution(executionId);

    if (!execution) {
      throw new Error('Execution not found');
    }

    // Calculate summary
    const nodeResults: Record<string, any> = {};
    let successNodes = 0;
    let failedNodes = 0;
    let skippedNodes = 0;

    for (const nodeExecution of execution.nodes || []) {
      nodeResults[nodeExecution.nodeId] = nodeExecution;

      if (nodeExecution.status === 'success') {
        successNodes++;
      } else if (nodeExecution.status === 'error') {
        failedNodes++;
      } else if (nodeExecution.status === 'skipped') {
        skippedNodes++;
      }
    }

    return {
      execution,
      nodeResults,
      summary: {
        totalNodes: execution.nodes?.length || 0,
        successNodes,
        failedNodes,
        skippedNodes,
        duration: execution.duration || 0
      }
    };
  },

  /**
   * Stop execution
   */
  async stopExecution(executionId: string): Promise<void> {
    // TODO: Implement stop execution endpoint on backend
    // await api.executions.stop(executionId);
    console.log(`Stopping execution: ${executionId}`);
  },

  /**
   * Get execution statistics
   */
  async getExecutionStats(workflowId: string, tenantId: string): Promise<{
    totalExecutions: number;
    successCount: number;
    errorCount: number;
    avgDuration: number;
    lastExecuted: number | null;
  }> {
    const executions = await workflowDB.executions
      .where('[tenantId+workflowId]')
      .equals([tenantId, workflowId])
      .toArray();

    let successCount = 0;
    let errorCount = 0;
    let totalDuration = 0;
    let lastExecuted: number | null = null;

    for (const execution of executions) {
      if (execution.status === 'success') {
        successCount++;
      } else if (execution.status === 'error') {
        errorCount++;
      }

      if (execution.endTime && (!lastExecuted || execution.endTime > lastExecuted)) {
        lastExecuted = execution.endTime;
      }

      if (execution.duration) {
        totalDuration += execution.duration;
      }
    }

    return {
      totalExecutions: executions.length,
      successCount,
      errorCount,
      avgDuration: executions.length > 0 ? totalDuration / executions.length : 0,
      lastExecuted
    };
  },

  /**
   * Export execution results
   */
  async exportExecutionResults(
    executionId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const details = await this.getExecutionDetails(executionId);

    if (format === 'json') {
      return JSON.stringify(details, null, 2);
    } else if (format === 'csv') {
      // Convert to CSV
      const headers = ['Node ID', 'Status', 'Duration', 'Output'];
      const rows = Object.entries(details.nodeResults).map(([nodeId, result]) => [
        nodeId,
        result.status,
        result.duration || 0,
        result.output ? JSON.stringify(result.output) : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    }

    throw new Error(`Unsupported export format: ${format}`);
  },

  /**
   * Clear execution history
   */
  async clearExecutionHistory(workflowId: string, tenantId: string): Promise<void> {
    const executions = await workflowDB.executions
      .where('[tenantId+workflowId]')
      .equals([tenantId, workflowId])
      .toArray();

    await Promise.all(executions.map((e) => workflowDB.executions.delete(e.id)));
  }
};
