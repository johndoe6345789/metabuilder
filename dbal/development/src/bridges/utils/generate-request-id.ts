/**
 * @file generate-request-id.ts
 * @description Generate unique request ID for RPC calls
 */

let requestIdCounter = 0

/**
 * Generate a unique request ID
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${++requestIdCounter}`
}

/**
 * Reset the counter (useful for testing)
 */
export const resetRequestIdCounter = (): void => {
  requestIdCounter = 0
}
