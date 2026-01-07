/**
 * Standardized API response utilities
 * 
 * Provides consistent error and success response formats across all API routes.
 */
import { NextResponse } from 'next/server'

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
} as const

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: ApiError
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: HttpStatus = HTTP_STATUS.OK,
  meta?: Record<string, unknown>
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { success: true, data }
  if (meta !== undefined) {
    body.meta = meta
  }
  return NextResponse.json(body, { status })
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: HttpStatus = HTTP_STATUS.INTERNAL_ERROR,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const error: ApiError = { code, message }
  if (details !== undefined) {
    error.details = details
  }
  return NextResponse.json({ success: false, error }, { status })
}

// Common error responses
export const Errors = {
  unauthorized: (message = 'Authentication required') =>
    errorResponse('UNAUTHORIZED', message, HTTP_STATUS.UNAUTHORIZED),
  
  forbidden: (message = 'Access denied') =>
    errorResponse('FORBIDDEN', message, HTTP_STATUS.FORBIDDEN),
  
  notFound: (resource = 'Resource') =>
    errorResponse('NOT_FOUND', `${resource} not found`, HTTP_STATUS.NOT_FOUND),
  
  badRequest: (message: string, details?: unknown) =>
    errorResponse('BAD_REQUEST', message, HTTP_STATUS.BAD_REQUEST, details),
  
  validationError: (details: unknown) =>
    errorResponse('VALIDATION_ERROR', 'Invalid request data', HTTP_STATUS.UNPROCESSABLE_ENTITY, details),
  
  conflict: (message: string) =>
    errorResponse('CONFLICT', message, HTTP_STATUS.CONFLICT),
  
  internal: (message = 'Internal server error') =>
    errorResponse('INTERNAL_ERROR', message, HTTP_STATUS.INTERNAL_ERROR),
}
