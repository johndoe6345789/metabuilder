/**
 * Error Reporting & Logging System
 *
 * Centralized error handling, logging, and user-friendly error messages.
 * Supports both development and production error reporting, with error
 * categorization for better recovery strategies.
 */

import type { ErrorCategory, ErrorReport, ErrorReportContext } from './error-reporting/types'
import { categorizeError } from './error-reporting/error-category'
import { categoryMessage } from './error-reporting/user-message'
import { extractStatusCode } from './error-reporting/extract-status-code'
import { buildErrorReport } from './error-reporting/build-report'
import { logReport } from './error-reporting/log-report'

export type { ErrorCategory, ErrorReportContext, ErrorReport }

class ErrorReportingService {
  private errors: ErrorReport[] = []
  private readonly maxErrors = 100 // Keep last 100 errors in memory

  /** Report an error with context. */
  reportError(
    error: Error | string,
    context: ErrorReportContext = {}
  ): ErrorReport {
    const report = buildErrorReport(error, context)

    this.errors.push(report)
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    logReport(report)
    return report
  }

  /** Get user-friendly error message. */
  getUserMessage(error: Error | string, category?: ErrorCategory): string {
    if (typeof error === 'string') return error

    const statusCode = extractStatusCode(error)
    const errorCategory = category ?? categorizeError(error, statusCode)

    // Detailed message in development, generic in production.
    if (process.env.NODE_ENV === 'development') return error.message
    return categoryMessage(errorCategory)
  }

  getErrors(): ErrorReport[] {
    return [...this.errors]
  }

  getErrorsByCategory(category: ErrorCategory): ErrorReport[] {
    return this.errors.filter(error => error.category === category)
  }

  getRetryableErrors(): ErrorReport[] {
    return this.errors.filter(error => error.isRetryable)
  }

  clearErrors(): void {
    this.errors = []
  }
}

// Singleton instance
export const errorReporting = new ErrorReportingService()

/** Hook for React components to report errors. */
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
