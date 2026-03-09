/**
 * Logger utility for Quality Validator
 * Handles structured logging with color support
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Simple logger with color support for console output
 */
export class Logger {
  private static instance: Logger;
  private verbose: boolean = false;
  private useColors: boolean = true;
  private logs: LogEntry[] = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Configure logger
   */
  configure(options: { verbose?: boolean; useColors?: boolean }): void {
    if (options.verbose !== undefined) {
      this.verbose = options.verbose;
    }
    if (options.useColors !== undefined) {
      this.useColors = options.useColors;
    }
  }

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
    if (this.useColors) {
      console.error(`${this.red('✖')} ${this.red(message)}`, context || '');
    } else {
      console.error(`[ERROR] ${message}`, context || '');
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
    if (this.useColors) {
      console.warn(`${this.yellow('⚠')} ${this.yellow(message)}`, context || '');
    } else {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
    if (this.useColors) {
      console.log(`${this.blue('ℹ')} ${this.blue(message)}`, context || '');
    } else {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log debug message (only if verbose)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.verbose) return;

    this.log('debug', message, context);
    if (this.useColors) {
      console.log(`${this.gray('◆')} ${this.gray(message)}`, context || '');
    } else {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Internal log tracking
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    this.logs.push({
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
    });
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Color utilities
   */
  private red(text: string): string {
    return `\x1b[31m${text}\x1b[0m`;
  }

  private yellow(text: string): string {
    return `\x1b[33m${text}\x1b[0m`;
  }

  private green(text: string): string {
    return `\x1b[32m${text}\x1b[0m`;
  }

  private blue(text: string): string {
    return `\x1b[34m${text}\x1b[0m`;
  }

  private gray(text: string): string {
    return `\x1b[90m${text}\x1b[0m`;
  }

  private cyan(text: string): string {
    return `\x1b[36m${text}\x1b[0m`;
  }

  private magenta(text: string): string {
    return `\x1b[35m${text}\x1b[0m`;
  }

  /**
   * Public color utilities for reporting
   */
  public colorize(text: string, color: 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'gray' | 'magenta'): string {
    if (!this.useColors) return text;

    switch (color) {
      case 'red':
        return this.red(text);
      case 'green':
        return this.green(text);
      case 'yellow':
        return this.yellow(text);
      case 'blue':
        return this.blue(text);
      case 'cyan':
        return this.cyan(text);
      case 'gray':
        return this.gray(text);
      case 'magenta':
        return this.magenta(text);
      default:
        return text;
    }
  }

  /**
   * Format table for console output
   */
  table(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    const keys = Object.keys(data[0]);
    const colWidths = keys.map((key) => {
      const max = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      );
      return max + 2;
    });

    let result = '';

    // Header
    result += keys.map((key, i) => key.padEnd(colWidths[i])).join('') + '\n';
    result += colWidths.map((width) => '-'.repeat(width)).join('') + '\n';

    // Rows
    for (const row of data) {
      result += keys.map((key, i) => String(row[key] || '').padEnd(colWidths[i])).join('') + '\n';
    }

    return result;
  }
}

export const logger = Logger.getInstance();
