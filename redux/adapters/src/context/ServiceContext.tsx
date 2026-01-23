import React, { createContext, useContext, ReactNode } from 'react'
import { IServiceProviders } from '../types'

/**
 * ServiceContext
 *
 * React context for providing service adapters to all hooks.
 * This enables dependency injection and supports multiple implementations
 * (production, test, mock, etc.) without modifying hook code.
 */
export const ServiceContext = createContext<IServiceProviders | null>(null)

/**
 * ServiceProvider
 *
 * Context provider that makes service adapters available to all hooks.
 *
 * @example
 * ```tsx
 * const services: IServiceProviders = {
 *   projectService: new DefaultProjectServiceAdapter(),
 *   workspaceService: new DefaultWorkspaceServiceAdapter(),
 *   workflowService: new DefaultWorkflowServiceAdapter(),
 *   executionService: new DefaultExecutionServiceAdapter(),
 *   authService: new DefaultAuthServiceAdapter(),
 * };
 *
 * <ServiceProvider services={services}>
 *   <App />
 * </ServiceProvider>
 * ```
 */
export function ServiceProvider({
  services,
  children,
}: {
  services: IServiceProviders
  children: ReactNode
}) {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  )
}

/**
 * useServices
 *
 * Hook to access service adapters in any component or custom hook.
 * Must be used within ServiceProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { projectService } = useServices()
 *   const projects = await projectService.listProjects(tenantId)
 * }
 * ```
 *
 * @throws Error if used outside of ServiceProvider
 */
export function useServices(): IServiceProviders {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error(
      'useServices must be used within ServiceProvider. ' +
      'Make sure your component is wrapped with <ServiceProvider services={...}> at the top level.'
    )
  }
  return context
}
