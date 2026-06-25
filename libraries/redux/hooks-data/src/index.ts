/**
 * @metabuilder/hooks-data
 *
 * Data management hooks with service adapter injection.
 *
 * These Tier 2 hooks manage application data (projects, workspaces, workflows, execution)
 * and inject service adapters for flexible backend implementations.
 *
 * Features:
 * - Decoupled from specific service implementations
 * - Works with HTTP, GraphQL, mock, or any adapter
 * - Full Redux integration
 * - TypeScript type safety
 * - Testing-friendly with mock adapters
 *
 * @example
 * // In your app initialization:
 * import { ServiceProvider, DefaultProjectServiceAdapter } from '@metabuilder/service-adapters'
 * import { useProject } from '@metabuilder/hooks-data'
 *
 * const services = {
 *   projectService: new DefaultProjectServiceAdapter('/api'),
 *   // ... other service adapters
 * }
 *
 * export function App() {
 *   return (
 *     <ServiceProvider services={services}>
 *       <YourApp />
 *     </ServiceProvider>
 *   )
 * }
 *
 * // In any component:
 * function Projects() {
 *   const { projects, loadProjects, createProject } = useProject()
 *   // ...
 * }
 */

export { useProject } from './useProject'
export { useWorkspace } from './useWorkspace'
export { useWorkflow } from './useWorkflow'
export { useExecution } from './useExecution'

// Re-export types from service adapters
export type {
  IProjectServiceAdapter,
  IWorkspaceServiceAdapter,
  IWorkflowServiceAdapter,
  IExecutionServiceAdapter,
  Project,
  Workspace,
  Workflow,
  WorkflowNode,
  WorkflowConnection,
  ExecutionResult,
  ExecutionStats,
} from '@metabuilder/service-adapters'
