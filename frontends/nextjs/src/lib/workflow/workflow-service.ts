/**
 * Workflow Service - Next.js Integration
 *
 * Manages workflow execution lifecycle:
 * - Initializes DAG executor with node executors
 * - Loads workflow definitions from database
 * - Handles execution state persistence
 * - Provides error handling and logging
 *
 * Part of the 95% data pattern: DAG structure is JSON, execution is TypeScript
 */

import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db-client'
import {
  DAGExecutor,
  type NodeExecutorFn,
} from '@metabuilder/workflow'
import {
  getNodeExecutorRegistry,
} from '@metabuilder/workflow'
import {
  type WorkflowDefinition,
  type WorkflowContext,
  type ExecutionState,
  type NodeResult,
  type ExecutionRecord,
  type ExecutionMetrics,
} from '@metabuilder/workflow'

/**
 * Execution engine that wraps DAGExecutor with database persistence
 */
export class WorkflowExecutionEngine {
  private registry = getNodeExecutorRegistry()

  /**
   * Execute a workflow from definition
   *
   * @param workflow - Workflow definition (JSON from database)
   * @param context - Execution context with user, tenant, variables
   * @returns Execution record with state and metrics
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    context: WorkflowContext
  ): Promise<ExecutionRecord> {
    const executionId = context.executionId || uuidv4()

    try {
      // Create execution record
      const startTime = new Date()

      // Create node executor callback
      const nodeExecutor: NodeExecutorFn = async (
        nodeId,
        wf,
        ctx,
        state
      ): Promise<NodeResult> => {
        const node = wf.nodes.find((n) => n.id === nodeId)
        if (!node) {
          throw new Error(`Node not found: ${nodeId}`)
        }

        // Get executor from registry
        const executor = this.registry.get(node.nodeType)
        if (!executor) {
          throw new Error(
            `No executor registered for node type: ${node.nodeType}`
          )
        }

        // Execute the node
        try {
          const result = await executor.execute(node, ctx, state)
          return result
        } catch (error) {
          return {
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            errorCode: 'EXECUTION_FAILED',
            timestamp: Date.now(),
          }
        }
      }

      // Create and execute DAG
      const dagExecutor = new DAGExecutor(
        executionId,
        workflow,
        context,
        nodeExecutor
      )

      const state = await dagExecutor.execute()
      const metrics = dagExecutor.getMetrics()

      // Determine final status
      const failedNodeCount = Object.values(state).filter(
        (r) => r.status === 'error'
      ).length
      const finalStatus =
        failedNodeCount > 0
          ? 'error'
          : Object.values(state).every((r) => r.status === 'success')
            ? 'success'
            : 'error'

      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()

      // Create execution record
      const executionRecord: ExecutionRecord = {
        id: executionId,
        workflowId: workflow.id,
        tenantId: context.tenantId,
        userId: context.userId,
        triggeredBy: context.trigger?.kind || 'manual',
        startTime,
        endTime,
        duration,
        status: finalStatus as any,
        state,
        metrics: {
          nodesExecuted: metrics.nodesExecuted,
          successNodes: metrics.successNodes,
          failedNodes: metrics.failedNodes,
          retriedNodes: metrics.retriedNodes,
          totalRetries: metrics.totalRetries,
          peakMemory: metrics.peakMemory,
          dataProcessed: 0, // Track in node executors
          apiCallsMade: 0, // Track in API node executors
        },
        logs: [], // Populate from execution logs
        error:
          failedNodeCount > 0
            ? {
                message: `${failedNodeCount} node(s) failed`,
                code: 'WORKFLOW_FAILED',
              }
            : undefined,
      }

      // Save execution record to database
      try {
        await this.saveExecutionRecord(executionRecord)
      } catch (saveError) {
        console.error('Failed to save execution record:', saveError)
        // Continue even if save fails - don't lose execution state
      }

      return executionRecord
    } catch (error) {
      const endTime = new Date()
      const startTime = new Date(context.trigger?.metadata?.startTime || Date.now())
      const duration = endTime.getTime() - startTime.getTime()

      // Create error execution record
      const errorRecord: ExecutionRecord = {
        id: executionId,
        workflowId: workflow.id,
        tenantId: context.tenantId,
        userId: context.userId,
        triggeredBy: context.trigger?.kind || 'manual',
        startTime,
        endTime,
        duration,
        status: 'error',
        state: {},
        metrics: {
          nodesExecuted: 0,
          successNodes: 0,
          failedNodes: 0,
          retriedNodes: 0,
          totalRetries: 0,
          peakMemory: 0,
          dataProcessed: 0,
          apiCallsMade: 0,
        },
        logs: [],
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'EXECUTION_ERROR',
        },
      }

      try {
        await this.saveExecutionRecord(errorRecord)
      } catch (saveError) {
        console.error('Failed to save error record:', saveError)
      }

      throw error
    }
  }

  /**
   * Save execution record to database
   *
   * @param record - Execution record to save
   */
  private async saveExecutionRecord(record: ExecutionRecord): Promise<void> {
    // Save to database (implementation depends on DBAL schema)
    // For now, this is a placeholder that logs
    console.log('Execution record saved:', {
      id: record.id,
      workflow: record.workflowId,
      status: record.status,
      duration: record.duration,
      metrics: record.metrics,
    })
  }

  /**
   * Load workflow from database by ID
   *
   * @param workflowId - Workflow ID
   * @param tenantId - Tenant ID for multi-tenant safety
   * @returns Workflow definition or null if not found
   */
  async loadWorkflow(
    workflowId: string,
    tenantId: string
  ): Promise<WorkflowDefinition | null> {
    try {
      // This is a placeholder - implement based on DBAL schema
      // const workflow = await db.workflows.findOne({
      //   id: workflowId,
      //   tenantId
      // })
      // return workflow || null
      return null
    } catch (error) {
      console.error('Failed to load workflow:', error)
      return null
    }
  }

  /**
   * Get execution status
   *
   * @param executionId - Execution ID
   * @param tenantId - Tenant ID for multi-tenant safety
   * @returns Execution record or null
   */
  async getExecutionStatus(
    executionId: string,
    tenantId: string
  ): Promise<ExecutionRecord | null> {
    try {
      // Placeholder - implement based on DBAL schema
      // const execution = await db.executions.findOne({
      //   id: executionId,
      //   tenantId
      // })
      // return execution || null
      return null
    } catch (error) {
      console.error('Failed to get execution status:', error)
      return null
    }
  }

  /**
   * List recent executions for workflow
   *
   * @param workflowId - Workflow ID
   * @param tenantId - Tenant ID
   * @param limit - Max results
   * @returns Array of execution records
   */
  async listExecutions(
    workflowId: string,
    tenantId: string,
    limit: number = 50
  ): Promise<ExecutionRecord[]> {
    try {
      // Placeholder - implement based on DBAL schema
      // const executions = await db.executions.list({
      //   filter: { workflowId, tenantId },
      //   limit,
      //   sort: { startTime: -1 }
      // })
      // return executions
      return []
    } catch (error) {
      console.error('Failed to list executions:', error)
      return []
    }
  }

  /**
   * Abort running execution
   *
   * @param executionId - Execution ID to abort
   * @param tenantId - Tenant ID
   */
  async abortExecution(executionId: string, tenantId: string): Promise<void> {
    try {
      // Placeholder - implement abort logic
      console.log(`Aborting execution: ${executionId}`)
    } catch (error) {
      console.error('Failed to abort execution:', error)
    }
  }
}

/**
 * Global execution engine instance
 */
let executionEngine: WorkflowExecutionEngine | null = null

/**
 * Get global execution engine instance
 */
export function getWorkflowExecutionEngine(): WorkflowExecutionEngine {
  if (!executionEngine) {
    executionEngine = new WorkflowExecutionEngine()
  }
  return executionEngine
}

/**
 * Initialize workflow engine on startup
 * Registers built-in node executors
 */
export async function initializeWorkflowEngine(): Promise<void> {
  const registry = getNodeExecutorRegistry()

  // Register built-in executors
  // These should be imported from @metabuilder/workflow/plugins
  console.log('Workflow engine initialized')
  console.log(`Registered node types: ${registry.listExecutors().join(', ')}`)
}
