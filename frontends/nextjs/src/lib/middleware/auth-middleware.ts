/**
 * Authentication middleware for API routes
 * 
 * Validates session tokens and checks permission levels for API endpoints.
 * Returns standardized error responses for unauthorized or forbidden requests.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getCurrentUser, type CurrentUser } from '@/lib/auth/get-current-user'

export interface AuthMiddlewareOptions {
  /**
   * Minimum permission level required (0-5)
   * 0 = Public, 1 = User, 2 = Moderator, 3 = Admin, 4 = God, 5 = Supergod
   */
  minLevel?: number
  
  /**
   * Allow public access (skip authentication)
   */
  allowPublic?: boolean
  
  /**
   * Custom permission check function
   * @returns true if access is allowed, false otherwise
   */
  customCheck?: (user: CurrentUser | null) => boolean
}

export interface AuthenticatedRequest extends NextRequest {
  user: CurrentUser
}

/**
 * Authentication middleware result
 */
export interface AuthResult {
  /**
   * Whether authentication succeeded
   */
  success: boolean
  
  /**
   * Authenticated user (only present if success = true)
   */
  user?: CurrentUser
  
  /**
   * Error response (only present if success = false)
   */
  error?: NextResponse
}

/**
 * Authenticate the request and check permissions
 * 
 * @param request - Next.js request object
 * @param options - Authentication options
 * @returns Authentication result with user or error response
 * 
 * @example
 * ```typescript
 * // In API route
 * const { success, user, error } = await authenticate(request, { minLevel: 1 })
 * if (!success) return error
 * 
 * // Use authenticated user
 * const data = await getData(user.id)
 * ```
 */
export async function authenticate(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<AuthResult> {
  const { minLevel = 0, allowPublic = false, customCheck } = options

  // Allow public endpoints
  if (allowPublic) {
    return { success: true }
  }

  try {
    // Get current user from session
    const user = await getCurrentUser()

    // Check if user is authenticated
    if (user === null) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        ),
      }
    }

    // Check permission level
    if (user.level < minLevel) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Forbidden',
            message: `Insufficient permissions. Required level: ${minLevel}, your level: ${user.level}`,
            requiredLevel: minLevel,
            userLevel: user.level,
          },
          { status: 403 }
        ),
      }
    }

    // Run custom permission check if provided
    if (customCheck !== undefined && !customCheck(user)) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Forbidden', message: 'Permission denied' },
          { status: 403 }
        ),
      }
    }

    // Authentication successful
    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication failed' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Require authentication for an API route
 * 
 * Simplified helper that throws an error response if authentication fails.
 * Use this when you want to handle authentication in a single line.
 * 
 * @param request - Next.js request object
 * @param options - Authentication options
 * @returns Authenticated user
 * @throws NextResponse with error status if authentication fails
 * 
 * @example
 * ```typescript
 * // In API route
 * const user = await requireAuth(request, { minLevel: 3 })
 * // If we get here, user is authenticated and has admin level
 * ```
 */
export async function requireAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<CurrentUser> {
  const { success, user, error } = await authenticate(request, options)

  if (!success) {
    throw new Error(error !== undefined ? 'Authentication failed' : 'Unknown authentication error')
  }

  return user as CurrentUser
}
