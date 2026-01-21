/**
 * Error Reporting & Logging System
 *
 * Centralized error handling, logging, and user-friendly error messages.
 * Supports both development and production error reporting.
 */

export interface ErrorReportContext {
  component?: string
  userId?: string
  tenantId?: string
  action?: string
  timestamp?: Date
  [key: string]: unknown
}

export interface ErrorReport {
  id: string
  message: string
  code?: string
  statusCode?: number
  stack?: string
  context: ErrorReportContext
  timestamp: Date
  isDevelopment: boolean
}

class ErrorReportingService {
  private errors: ErrorReport[] = []
  private maxErrors = 100 // Keep last 100 errors in memory

  /**
   * Report an error with context
   */
  reportError(error: Error | string, context: ErrorReportContext = {}): ErrorReport {
    const report: ErrorReport = {
      id: this.generateId(),
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        ...context,
        timestamp: new Date(),
      },
      timestamp: new Date(),
      isDevelopment: process.env.NODE_ENV === 'development',
    }

    this.errors.push(report)

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorReporting]', {
        message: report.message,
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
   * Get user-friendly error message
   */
  getUserMessage(error: Error | string): string {
    if (typeof error === 'string') {
      return error
    }

    // Extract status code from common error patterns
    const statusMatch = error.message.match(/(\d{3})/)?.[1]
    if (statusMatch) {
      return this.getHttpErrorMessage(parseInt(statusMatch, 10))
    }

    // Return generic message in production, detailed in development
    if (process.env.NODE_ENV === 'development') {
      return error.message
    }

    // Check for common error patterns
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }

    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }

    if (error.message.includes('permission')) {
      return 'You do not have permission to perform this action.'
    }

    return 'An error occurred. Please try again later.'
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
