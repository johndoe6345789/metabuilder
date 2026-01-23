/**
 * @metabuilder/hooks-auth
 *
 * Authentication hooks with service adapter injection.
 *
 * These Tier 2 hooks manage user authentication (login, register, password validation)
 * and inject service adapters for flexible backend implementations.
 *
 * Features:
 * - Decoupled from specific service implementations
 * - Works with HTTP, GraphQL, mock, or any adapter
 * - Full Redux integration
 * - TypeScript type safety
 * - Comprehensive validation
 * - Testing-friendly with mock adapters
 *
 * @example
 * // In your app initialization:
 * import { ServiceProvider, DefaultAuthServiceAdapter } from '@metabuilder/service-adapters'
 * import { useLoginLogic } from '@metabuilder/hooks-auth'
 *
 * const services = {
 *   authService: new DefaultAuthServiceAdapter('/api'),
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
 * // In a login component:
 * function LoginForm() {
 *   const { handleLogin } = useLoginLogic()
 *   // ...
 * }
 */

export { useLoginLogic, type LoginData, type UseLoginLogicReturn } from './useLoginLogic'
export { useRegisterLogic, type RegistrationData, type UseRegisterLogicReturn } from './useRegisterLogic'
export {
  usePasswordValidation,
  type PasswordValidationResult,
  type UsePasswordValidationReturn,
} from './usePasswordValidation'

// Re-export types from service adapters
export type { IAuthServiceAdapter, AuthResponse, User } from '@metabuilder/service-adapters'
