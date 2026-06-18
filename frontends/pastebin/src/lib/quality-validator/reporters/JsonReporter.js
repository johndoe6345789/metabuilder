/**
 * JSON Reporter
 * Generates machine-readable JSON reports
 * Refactored to use ReporterBase for shared functionality
 */
import { ReporterBase } from './ReporterBase.js';
/**
 * JSON Reporter
 * Extends ReporterBase to leverage shared metadata handling and utilities
 */
export class JsonReporter extends ReporterBase {
    /**
     * Generate JSON report
     */
    generate(result) {
        const report = {
            metadata: result.metadata,
            overall: result.overall,
            componentScores: result.componentScores,
            codeQuality: result.metadata.configUsed.codeQuality,
            testCoverage: result.metadata.configUsed.testCoverage,
            architecture: result.metadata.configUsed.architecture,
            security: result.metadata.configUsed.security,
            findings: result.findings,
            recommendations: result.recommendations,
            trend: result.trend,
        };
        return JSON.stringify(report, null, 2);
    }
    /**
     * Parse JSON report
     */
    parse(json) {
        return JSON.parse(json);
    }
}
export const jsonReporter = new JsonReporter();
