/**
 * Structured logging utility
 * 
 * Provides safe logging that doesn't expose stack traces in production.
 * Use this instead of direct console.log/error calls.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Safely extract error message without exposing stack trace
 */
function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}

/**
 * Format log entry for output
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context !== undefined ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
}

/**
 * Logger with safe error handling
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(formatLog('debug', message, context))
    }
  },

  info(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.log(formatLog('info', message, context))
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatLog('warn', message, context))
  },

  /**
   * Log error safely - exposes stack trace only in development
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorMessage = error !== undefined ? safeErrorMessage(error) : undefined
    const logContext = errorMessage !== undefined 
      ? { ...context, error: errorMessage }
      : context

    console.error(formatLog('error', message, logContext))

    // In development, also log the full stack trace
    if (isDevelopment && error instanceof Error && error.stack !== undefined) {
      console.error(error.stack)
    }
  },
}

/**
 * Safe error logging for API routes
 * Returns only the message, never the stack trace
 */
export function apiError(error: unknown): string {
  return safeErrorMessage(error)
}
