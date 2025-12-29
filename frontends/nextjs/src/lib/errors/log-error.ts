import { formatError } from './format-error'

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  component?: string
  userId?: string
  action?: string
  [key: string]: unknown
}

/**
 * Centralized error logging with consistent format
 * Replaces scattered console.error calls throughout the codebase
 */
export function logError(
  error: unknown,
  context?: LogContext,
  level: LogLevel = LogLevel.ERROR
): void {
  const formatted = formatError(error)

  const logEntry = {
    level,
    timestamp: new Date().toISOString(),
    message: formatted.message,
    code: formatted.code,
    context,
    stack: formatted.stack,
  }

  // Use appropriate console method
  switch (level) {
    case LogLevel.ERROR:
      console.error('[Error]', logEntry)
      break
    case LogLevel.WARN:
      console.warn('[Warning]', logEntry)
      break
    case LogLevel.INFO:
      console.log('[Info]', logEntry)
      break
    case LogLevel.DEBUG:
      console.log('[Debug]', logEntry)
      break
  }

  // TODO: Send to error tracking service (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracker(logEntry)
  // }
}
