/**
 * Base Analyzer Abstract Class
 * Provides common interface and shared functionality for all analyzers
 * Implements SOLID principles:
 * - Single Responsibility: Base class handles common logic
 * - Open/Closed: Extensible through subclassing
 * - Liskov Substitution: All subclasses can be used interchangeably
 */

import {
  AnalysisResult,
  AnalysisCategory,
  Status,
  Finding,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

/**
 * Analyzer configuration interface
 */
export interface AnalyzerConfig {
  name: string;
  enabled: boolean;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Abstract base class for all analyzers
 */
export abstract class BaseAnalyzer {
  protected config: AnalyzerConfig;
  protected startTime: number = 0;
  protected findings: Finding[] = [];

  constructor(config: AnalyzerConfig) {
    this.config = config;
  }

  /**
   * Main analysis method - must be implemented by subclasses
   */
  abstract analyze(input?: any): Promise<AnalysisResult>;

  /**
   * Validation method - must be implemented by subclasses
   * Called before analysis to verify preconditions
   */
  abstract validate(): boolean;

  /**
   * Get analyzer configuration
   */
  protected getConfig(): AnalyzerConfig {
    return this.config;
  }

  /**
   * Log progress with automatic context
   */
  protected logProgress(
    message: string,
    context?: Record<string, unknown>,
  ): void {
    const executionTime = performance.now() - this.startTime;
    logger.debug(`[${this.config.name}] ${message}`, {
      ...context,
      executionTime: executionTime.toFixed(2) + "ms",
    });
  }

  /**
   * Record a finding
   */
  protected addFinding(finding: Finding): void {
    this.findings.push(finding);
  }

  /**
   * Get all recorded findings
   */
  protected getFindings(): Finding[] {
    return this.findings;
  }

  /**
   * Clear findings
   */
  protected clearFindings(): void {
    this.findings = [];
  }

  /**
   * Determine status based on score
   */
  protected getStatus(score: number): Status {
    if (score >= 80) return "pass";
    if (score >= 70) return "warning";
    return "fail";
  }

  /**
   * Calculate execution time in milliseconds
   */
  protected getExecutionTime(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Start timing
   */
  protected startTiming(): void {
    this.startTime = performance.now();
  }

  /**
   * Execute with error handling and timing
   */
  protected async executeWithTiming<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    this.startTiming();
    try {
      this.logProgress(`Starting ${operationName}...`);
      const result = await operation();
      this.logProgress(`${operationName} completed`, {
        success: true,
      });
      return result;
    } catch (error) {
      logger.error(`${this.config.name}: ${operationName} failed`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Safe file reading with error handling
   */
  protected safeReadFile(
    filePath: string,
    operation: () => string,
  ): string | null {
    try {
      return operation();
    } catch (error) {
      this.logProgress(`Failed to read ${filePath}`, {
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Validate configuration
   */
  protected validateConfig(): boolean {
    if (!this.config || !this.config.name) {
      logger.error(`${this.config?.name || "Unknown"}: Invalid configuration`);
      return false;
    }
    return true;
  }
}
