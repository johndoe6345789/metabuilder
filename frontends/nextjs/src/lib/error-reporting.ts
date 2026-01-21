/**
 * Error Reporting & Logging System
 *
 * Centralized error handling, logging, and user-friendly error messages.
 * Supports both development and production error reporting.
 * Includes error categorization for better recovery strategies.
 */

export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'permission'
  | 'validation'
  | 'not-found'
  | 'conflict'
  | 'rate-limit'
  | 'server'
  | 'timeout'
  | 'unknown'

export interface ErrorReportContext {
  component?: string
  userId?: string
  tenantId?: string
  action?: string
  timestamp?: Date
  retryable?: boolean
  retryCount?: number
  [key: string]: unknown
}

export interface ErrorReport {
  id: string
  message: string
  code?: string
  statusCode?: number
  category: ErrorCategory
  stack?: string
  context: ErrorReportContext
  timestamp: Date
  isDevelopment: boolean
  isRetryable: boolean
  suggestedAction?: string
}

class ErrorReportingService {
  private errors: ErrorReport[] = []
  private maxErrors = 100 // Keep last 100 errors in memory

  /**
   * Categorize error based on message and type
   */
  private categorizeError(error: Error | string, statusCode?: number): ErrorCategory {
    const message = typeof error === 'string' ? error : error.message
    const messageStr = message.toLowerCase()

    // Check HTTP status codes first
    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) return 'authentication'
      if (statusCode === 403) return 'permission'
      if (statusCode === 404) return 'not-found'
      if (statusCode === 409) return 'conflict'
      if (statusCode === 429) return 'rate-limit'
      if (statusCode >= 500) return 'server'
      if (statusCode === 408) return 'timeout'
    }

    // Pattern matching for common error types
    if (messageStr.includes('network') || messageStr.includes('fetch') || messageStr.includes('offline')) {
      return 'network'
    }
    if (messageStr.includes('unauthorized') || messageStr.includes('auth') || messageStr.includes('401')) {
      return 'authentication'
    }
    if (messageStr.includes('permission') || messageStr.includes('forbidden') || messageStr.includes('403')) {
      return 'permission'
    }
    if (messageStr.includes('not found') || messageStr.includes('404')) {
      return 'not-found'
    }
    if (messageStr.includes('conflict') || messageStr.includes('duplicate') || messageStr.includes('409')) {
      return 'conflict'
    }
    if (messageStr.includes('rate') || messageStr.includes('too many') || messageStr.includes('429')) {
      return 'rate-limit'
    }
    if (messageStr.includes('timeout') || messageStr.includes('408') || messageStr.includes('timed out')) {
      return 'timeout'
    }
    if (messageStr.includes('validation') || messageStr.includes('invalid') || messageStr.includes('400')) {
      return 'validation'
    }
    if (messageStr.includes('server') || messageStr.includes('500') || messageStr.includes('error')) {
      return 'server'
    }

    return 'unknown'
  }

  /**
   * Determine if error is retryable
   */
  private isErrorRetryable(category: ErrorCategory, statusCode?: number): boolean {
    const retryableCategories: ErrorCategory[] = ['network', 'timeout', 'rate-limit', 'server']
    if (retryableCategories.includes(category)) {
      return true
    }

    // Retryable HTTP status codes
    if (statusCode && [408, 429, 500, 502, 503, 504].includes(statusCode)) {
      return true
    }

    return false
  }

  /**
   * Get suggested action for error recovery
   */
  private getSuggestedAction(category: ErrorCategory): string {
    const actions: Record<ErrorCategory, string> = {
      network: 'Check your internet connection and try again',
      authentication: 'Log in again or refresh your credentials',
      permission: 'Contact your administrator for access',
      validation: 'Please verify your input and try again',
      'not-found': 'The requested resource no longer exists',
      conflict: 'This resource already exists. Please use a different name',
      'rate-limit': 'Too many requests. Please wait a moment and try again',
      server: 'The server is experiencing issues. Please try again later',
      timeout: 'Request took too long. Please try again',
      unknown: 'Please try again or contact support',
    }

    return actions[category] ?? 'Please try again or contact support'
  }

  /**
   * Report an error with context
   */
  reportError(error: Error | string, context: ErrorReportContext = {}): ErrorReport {
    const statusCode = context.statusCode as number | undefined || this.extractStatusCode(error)
    const category = this.categorizeError(error, statusCode)
    const isRetryable = this.isErrorRetryable(category, statusCode)
    const suggestedAction = this.getSuggestedAction(category)

    const report: ErrorReport = {
      id: this.generateId(),
      message: typeof error === 'string' ? error : error.message,
      code: context.code as string | undefined,
      statusCode,
      category,
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        ...context,
        timestamp: new Date(),
      },
      timestamp: new Date(),
      isDevelopment: process.env.NODE_ENV === 'development',
      isRetryable,
      suggestedAction,
    }

    this.errors.push(report)

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorReporting]', {
        id: report.id,
        message: report.message,
        category: report.category,
        isRetryable: report.isRetryable,
        suggestedAction: report.suggestedAction,
        context: report.context,
        stack: report.stack,
      })
    }

    // Send to monitoring in production (placeholder)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(report)
    }

    return report
  }

  /**
   * Extract HTTP status code from error message
   */
  private extractStatusCode(error: Error | string): number | undefined {
    const message = typeof error === 'string' ? error : error.message
    const match = message.match(/(\d{3})/)
    return match ? parseInt(match[1]!, 10) : undefined
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: Error | string, category?: ErrorCategory): string {
    if (typeof error === 'string') {
      return error
    }

    // Extract status code and determine category
    const statusCode = this.extractStatusCode(error)
    const errorCategory = category ?? this.categorizeError(error, statusCode)

    // Return detailed message in development, user-friendly in production
    if (process.env.NODE_ENV === 'development') {
      return error.message
    }

    // Use category-specific messages for production
    const categoryMessages: Record<ErrorCategory, string> = {
      network: 'Network error. Please check your internet connection and try again.',
      authentication: 'Your session has expired. Please log in again.',
      permission: 'You do not have permission to perform this action.',
      validation: 'The information you provided is invalid. Please check and try again.',
      'not-found': 'The requested resource was not found.',
      conflict: 'This resource already exists. Please use a different name.',
      'rate-limit': 'Too many requests. Please wait a moment and try again.',
      server: 'A server error occurred. Our team has been notified. Please try again later.',
      timeout: 'The request took too long to complete. Please try again.',
      unknown: 'An error occurred. Please try again or contact support if the problem persists.',
    }

    return categoryMessages[errorCategory] ?? categoryMessages.unknown
  }

  /**
   * Get user message for HTTP error codes
   */
  private getHttpErrorMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'You do not have permission to access this resource.',
      404: 'The requested resource was not found.',
      409: 'This resource already exists.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.',
    }

    return messages[statusCode] ?? 'An error occurred. Please try again.'
  }

  /**
   * Get all reported errors (development only)
   */
  getErrors(): ErrorReport[] {
    if (process.env.NODE_ENV !== 'development') {
      return []
    }
    return [...this.errors]
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ErrorReport[] {
    return this.errors.filter(error => error.category === category)
  }

  /**
   * Get retryable errors
   */
  getRetryableErrors(): ErrorReport[] {
    return this.errors.filter(error => error.isRetryable)
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * Send error to monitoring service (placeholder)
   */
  private sendToMonitoring(report: ErrorReport): void {
    // TODO: Implement actual monitoring integration (e.g., Sentry, DataDog)
    // Example:
    // fetch('/api/monitoring/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report),
    // }).catch(() => {})
  }

  /**
   * Generate unique ID for error report
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const errorReporting = new ErrorReportingService()

/**
 * Hook for React components to report errors
 */
export function useErrorReporting() {
  return {
    reportError: (error: Error | string, context: ErrorReportContext) => {
      return errorReporting.reportError(error, context)
    },
    getUserMessage: (error: Error | string) => {
      return errorReporting.getUserMessage(error)
    },
  }
}
