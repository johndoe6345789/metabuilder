/**
 * @file request-helpers.ts
 * @description Helper functions for API request processing
 */

import type { NextRequest } from 'next/server'

import type { UserRole } from '@/lib/level-types'

/**
 * Normalize role string to UserRole type
 */
export function normalizeRole(role?: string): UserRole | undefined {
  if (!role) return undefined
  if (role === 'public') return 'user'
  return role as UserRole
}

/**
 * Read and parse JSON from request body
 */
export async function readJson<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}
