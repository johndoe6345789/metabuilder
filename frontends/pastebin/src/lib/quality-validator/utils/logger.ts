import { colorize, formatTable, type ColorName } from './logger-colors.js'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  context?: Record<string, unknown>
}

export class Logger {
  private static instance: Logger
  private verbose = false
  private useColors = true
  private logs: LogEntry[] = []

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger()
    return Logger.instance
  }

  configure(options: { verbose?: boolean; useColors?: boolean }): void {
    if (options.verbose !== undefined) this.verbose = options.verbose
    if (options.useColors !== undefined) this.useColors = options.useColors
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context)
    const prefix = colorize('✖', 'red', this.useColors)
    const msg = colorize(message, 'red', this.useColors)
    if (this.useColors) {
      console.error(`${prefix} ${msg}`, context || '')
    } else {
      console.error(`[ERROR] ${message}`, context || '')
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
    if (this.useColors) {
      console.warn(
        `${colorize('⚠', 'yellow', true)} ${colorize(message, 'yellow', true)}`,
        context || '',
      )
    } else {
      console.warn(`[WARN] ${message}`, context || '')
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
    if (this.useColors) {
      console.log(
        `${colorize('ℹ', 'blue', true)} ${colorize(message, 'blue', true)}`,
        context || '',
      )
    } else {
      console.log(`[INFO] ${message}`, context || '')
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.verbose) return
    this.log('debug', message, context)
    if (this.useColors) {
      console.log(
        `${colorize('◆', 'gray', true)} ${colorize(message, 'gray', true)}`,
        context || '',
      )
    } else {
      console.log(`[DEBUG] ${message}`, context || '')
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    this.logs.push({
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
    })
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }
  clearLogs(): void {
    this.logs = []
  }

  public colorize(text: string, color: ColorName): string {
    return colorize(text, color, this.useColors)
  }

  table(data: Record<string, unknown>[]): string {
    return formatTable(data)
  }
}

export const logger = Logger.getInstance()
