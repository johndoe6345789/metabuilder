/**
 * Report format types and error classes for Quality Validation tool
 */

import type { Finding, Recommendation } from './core-types.js';
import type {
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
} from './metric-types.js';
import type {
  OverallScore,
  ComponentScores,
  ResultMetadata,
  TrendData,
} from './scoring-types.js';

// ============================================================================
// ERROR TYPES
// ============================================================================

export abstract class QualityValidationError extends Error {
  code: string;
  details?: string;
  solution?: string;
  context?: Record<string, unknown>;
  originalError?: Error;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, QualityValidationError.prototype);
  }
}

export class ConfigurationError extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'CONFIG_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class AnalysisErrorClass extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'ANALYSIS_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, AnalysisErrorClass.prototype);
  }
}

export class IntegrationError extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'INTEGRATION_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }
}

export class ReportingError extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'REPORTING_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, ReportingError.prototype);
  }
}

// ============================================================================
// REPORT FORMATS
// ============================================================================

export interface JsonReport {
  metadata: ResultMetadata;
  overall: OverallScore;
  componentScores: ComponentScores;
  codeQuality: CodeQualityMetrics;
  testCoverage: TestCoverageMetrics;
  architecture: ArchitectureMetrics;
  security: SecurityMetrics;
  findings: Finding[];
  recommendations: Recommendation[];
  trend?: TrendData;
}

export interface CsvRow {
  [key: string]: string | number | boolean;
}
