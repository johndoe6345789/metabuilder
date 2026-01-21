/**
 * JSON Reporter
 * Generates machine-readable JSON reports
 * Refactored to use ReporterBase for shared functionality
 */

import { ScoringResult, JsonReport } from '../types/index.js';
import { ReporterBase } from './ReporterBase.js';

/**
 * JSON Reporter
 * Extends ReporterBase to leverage shared metadata handling and utilities
 */
export class JsonReporter extends ReporterBase {
  /**
   * Generate JSON report
   */
  generate(result: ScoringResult): string {
    const report: JsonReport = {
      metadata: result.metadata,
      overall: result.overall,
      componentScores: result.componentScores,
      codeQuality: result.metadata.configUsed.codeQuality as any,
      testCoverage: result.metadata.configUsed.testCoverage as any,
      architecture: result.metadata.configUsed.architecture as any,
      security: result.metadata.configUsed.security as any,
      findings: result.findings,
      recommendations: result.recommendations,
      trend: result.trend,
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Parse JSON report
   */
  parse(json: string): JsonReport {
    return JSON.parse(json) as JsonReport;
  }
}

export const jsonReporter = new JsonReporter();
