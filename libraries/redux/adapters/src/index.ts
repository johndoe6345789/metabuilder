/**
 * @metabuilder/service-adapters
 *
 * Service adapter interfaces and implementations for decoupling
 * Tier 2 hooks from concrete service implementations.
 *
 * This package enables:
 * - Dependency injection of services into hooks
 * - Multiple backend implementations (HTTP, GraphQL, mock)
 * - Easy testing with in-memory mock adapters
 * - Framework-agnostic service contracts
 */

// Types and Interfaces
export * from './types'

// Context and Provider
export { ServiceContext, ServiceProvider, useServices } from './context/ServiceContext'

// Default HTTP-based implementations
export {
  DefaultProjectServiceAdapter,
  DefaultWorkspaceServiceAdapter,
  DefaultWorkflowServiceAdapter,
  DefaultExecutionServiceAdapter,
  DefaultAuthServiceAdapter,
} from './adapters/DefaultAdapters'

// Mock in-memory implementations
export {
  MockProjectServiceAdapter,
  MockWorkspaceServiceAdapter,
  MockWorkflowServiceAdapter,
  MockExecutionServiceAdapter,
  MockAuthServiceAdapter,
} from './adapters/MockAdapters'

/**
 * Quick start guide:
 *
 * 1. Create service instances:
 *    ```
 *    const services = {
 *      projectService: new DefaultProjectServiceAdapter(),
 *      workspaceService: new DefaultWorkspaceServiceAdapter(),
 *      workflowService: new DefaultWorkflowServiceAdapter(),
 *      executionService: new DefaultExecutionServiceAdapter(),
 *      authService: new DefaultAuthServiceAdapter(),
 *    }
 *    ```
 *
 * 2. Wrap your app with ServiceProvider:
 *    ```
 *    <ServiceProvider services={services}>
 *      <App />
 *    </ServiceProvider>
 *    ```
 *
 * 3. Use useServices hook in any hook or component:
 *    ```
 *    const { projectService } = useServices()
 *    const projects = await projectService.listProjects(tenantId)
 *    ```
 *
 * For testing:
 *    ```
 *    const mockServices = {
 *      projectService: new MockProjectServiceAdapter(),
 *      // ... etc
 *    }
 *    ```
 */
