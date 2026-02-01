/**
 * Hooks barrel export for frontends/nextjs
 *
 * Re-exports all hooks from @metabuilder/hooks plus local NextJS-specific auth hooks
 */

// Re-export everything from the centralized hooks package
export * from '@metabuilder/hooks'

// Local NextJS-specific auth exports (these depend on @/lib/auth/* APIs)
export type { AuthState, AuthUser, UseAuthReturn } from './auth/auth-types'
export { useAuth } from './useAuth'
