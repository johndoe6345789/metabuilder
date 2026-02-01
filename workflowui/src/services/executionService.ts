/**
 * Execution Service
 * Handles workflow execution with offline-first architecture
 */

import { api } from './api';
import { db } from '../db/schema';
import { ExecutionResult } from '../types/workflow';

export interface ExecutionRequest {
  nodes: any[];
  connections: any[];
  inputs?: Record<string, any>;
}

class ExecutionService {
  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    data: ExecutionRequest,
    tenantId: string = 'default'
  ): Promise<ExecutionResult> {
    try {
      // Optimistic UI: create local execution record immediately
      const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const execution: Partial<ExecutionResult> = {
        id: executionId,
        workflowId,
        workflowName: 'Unknown',
        status: 'running',
        startTime: Date.now(),
        nodes: [],
        tenantId
      };

      // Save to local IndexedDB first
      if (db?.executions) {
        await db.executions.add(execution as ExecutionResult);
      }

      // Try to execute on backend
      try {
        const result = await api.executions.execute(workflowId, data);

        // Update local record with result
        if (db?.executions) {
          await db.executions.update(executionId, {
            status: result.status || 'success',
            endTime: Date.now(),
            output: result.output,
            error: result.error
          });
        }

        return {
          id: executionId,
          workflowId,
          workflowName: execution.workflowName || 'Unknown',
          tenantId,
          status: (result.status || 'success') as any,
          startTime: execution.startTime!,
          endTime: Date.now(),
          nodes: result.nodes || [],
          output: result.output,
          error: result.error
        } as ExecutionResult;
      } catch (backendError) {
        // Backend execution failed - record error locally
        if (db?.executions) {
          await db.executions.update(executionId, {
            status: 'error',
            endTime: Date.now(),
            error: {
              code: 'BACKEND_ERROR',
              message: backendError instanceof Error ? backendError.message : 'Backend execution failed'
            }
          });
        }

        throw backendError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Execution failed';
      throw new Error(message);
    }
  }

  /**
   * Get execution history for a workflow
   */
  async getExecutionHistory(
    workflowId: string,
    tenantId: string = 'default',
    limit: number = 50
  ): Promise<ExecutionResult[]> {
    try {
      // Try to fetch from backend first
      try {
        const result = await api.executions.getHistory(workflowId, limit);

        // Cache results locally
        if (db?.executions && Array.isArray(result)) {
          for (const execution of result) {
            await db.executions.put({
              id: execution.id,
              workflowId,
              tenantId,
              ...execution
            }).catch(() => {
              // Ignore if record already exists
            });
          }
        }

        return result;
      } catch (backendError) {
        // Fall back to local cache
        console.warn('Failed to fetch from backend, using local cache:', backendError);
        if (db?.executions) {
          const executions = await db.executions
            .where({ workflowId, tenantId })
            .reverse()
            .limit(limit)
            .toArray();
          return executions;
        }
        return [];
      }
    } catch (error) {
      console.error('Failed to get execution history:', error);
      return [];
    }
  }

  /**
   * Get execution details
   */
  async getExecutionDetails(executionId: string): Promise<ExecutionResult | null> {
    try {
      // Try backend first
      try {
        const result = await api.executions.getById(executionId);

        // Cache locally
        if (db?.executions) {
          await db.executions.put(result).catch(() => {
            // Ignore if already exists
          });
        }

        return result;
      } catch (backendError) {
        // Fall back to local cache
        if (db?.executions) {
          return await db.executions.get(executionId);
        }
        return null;
      }
    } catch (error) {
      console.error('Failed to get execution details:', error);
      return null;
    }
  }

  /**
   * Get execution statistics for a workflow
   */
  async getExecutionStats(
    workflowId: string,
    tenantId: string = 'default'
  ): Promise<{
    totalExecutions: number;
    successCount: number;
    errorCount: number;
    averageDuration: number;
    lastExecution?: ExecutionResult;
  }> {
    try {
      // Get execution history
      const executions = await this.getExecutionHistory(workflowId, tenantId, 100);

      if (executions.length === 0) {
        return {
          totalExecutions: 0,
          successCount: 0,
          errorCount: 0,
          averageDuration: 0
        };
      }

      const successful = executions.filter(e => e.status === 'success');
      const errors = executions.filter(e => e.status === 'error');

      const durations = successful
        .filter(e => e.endTime)
        .map(e => (e.endTime! - e.startTime) / 1000); // Convert to seconds

      const averageDuration = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

      return {
        totalExecutions: executions.length,
        successCount: successful.length,
        errorCount: errors.length,
        averageDuration,
        lastExecution: executions[0]
      };
    } catch (error) {
      console.error('Failed to get execution stats:', error);
      return {
        totalExecutions: 0,
        successCount: 0,
        errorCount: 0,
        averageDuration: 0
      };
    }
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    try {
      // Mark as cancelled locally
      if (db?.executions) {
        await db.executions.update(executionId, {
          status: 'cancelled' as any,
          endTime: Date.now()
        });
      }

      // Attempt to cancel on backend (non-critical)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/executions/${executionId}/cancel`, {
          method: 'POST'
        });
      } catch (error) {
        console.warn('Failed to cancel execution on backend:', error);
      }
    } catch (error) {
      console.error('Failed to cancel execution:', error);
      throw error;
    }
  }

  /**
   * Clear execution history for a workflow
   */
  async clearExecutionHistory(
    workflowId: string,
    tenantId: string = 'default'
  ): Promise<void> {
    try {
      // Clear from local database
      if (db?.executions) {
        const executions = await db.executions
          .where({ workflowId, tenantId })
          .toArray();

        for (const execution of executions) {
          await db.executions.delete(execution.id);
        }
      }

      // Attempt to clear on backend (non-critical)
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/workflows/${workflowId}/executions`,
          { method: 'DELETE' }
        );
      } catch (error) {
        console.warn('Failed to clear execution history on backend:', error);
      }
    } catch (error) {
      console.error('Failed to clear execution history:', error);
      throw error;
    }
  }
}

export const executionService = new ExecutionService();
export default executionService;
