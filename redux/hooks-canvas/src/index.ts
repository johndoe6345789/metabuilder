/**
 * @metabuilder/hooks-canvas
 *
 * Canvas operation hooks with service adapter injection.
 *
 * These Tier 2 hooks manage canvas operations (loading items, creating, updating)
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
 * import { useCanvasItems } from '@metabuilder/hooks-canvas'
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
 * // In a canvas component:
 * function Canvas() {
 *   const { canvasItems, createCanvasItem } = useCanvasItems()
 *   // ...
 * }
 */

export { useCanvasItems, type UseCanvasItemsReturn } from './useCanvasItems'
export { useCanvasItemsOperations, type UseCanvasItemsOperationsReturn } from './useCanvasItemsOperations'

// Re-export types from service adapters
export type {
  IProjectServiceAdapter,
  ProjectCanvasItem,
  CreateCanvasItemRequest,
  UpdateCanvasItemRequest,
} from '@metabuilder/service-adapters'
