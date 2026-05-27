/**
 * Code quality metric types
 */

import type { FileLocation } from './core-types.js';

export interface CodeQualityMetrics {
  complexity: ComplexityMetrics;
  duplication: DuplicationMetrics;
  linting: LintingMetrics;
}

export interface ComplexityMetrics {
  functions: ComplexityFunction[];
  averagePerFile: number;
  maximum: number;
  distribution: {
    good: number;
    warning: number;
    critical: number;
  };
}

export interface ComplexityFunction {
  file: string;
  name: string;
  line: number;
  complexity: number;
  status: 'good' | 'warning' | 'critical';
}

export interface DuplicationMetrics {
  percent: number;
  lines: number;
  blocks: DuplicationBlock[];
  status: 'good' | 'warning' | 'critical';
}

export interface DuplicationBlock {
  locations: FileLocation[];
  size: number;
  lines: string[];
  suggestion: string;
}

export interface LintingMetrics {
  errors: number;
  warnings: number;
  info: number;
  violations: LintingViolation[];
  byRule: Map<string, LintingViolation[]>;
  status: 'good' | 'warning' | 'critical';
}

export interface LintingViolation {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  fixable: boolean;
}
