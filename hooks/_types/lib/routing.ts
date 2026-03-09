/**
 * Type stub for @/lib/routing
 * Provides session user retrieval for the useAuth hook.
 */

export interface SessionUserResult {
  user: Record<string, unknown> | null
}

/**
 * Get the current session user from the server.
 * In a Next.js app this reads the session cookie; the hooks package
 * only needs the type signature so it can compile standalone.
 */
export declare function getSessionUser(): Promise<SessionUserResult>
