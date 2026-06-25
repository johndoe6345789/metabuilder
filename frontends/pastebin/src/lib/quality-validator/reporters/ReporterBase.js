/**
 * Reporter Base Class
 * Abstract base class for all reporters with shared functionality
 */
import { fmtMetadata, fmtOverallScore, fmtComponentScores, fmtFindingStats, fmtRecStats, fmtTopRecommendations, fmtTopFindings, fmtFindingsDisplay, fmtGroupedFindings, escapeCsvField, buildCsvLine, fmtDuration, colorForValue, colorForSeverity, statusIcon, gradeColor, } from './reporter-helpers.js';
export class ReporterBase {
    getTimestamp() {
        return new Date().toISOString();
    }
    formatMetadata(metadata) {
        return fmtMetadata(metadata);
    }
    formatOverallScore(overall) {
        return fmtOverallScore(overall);
    }
    formatComponentScores(scores) {
        return fmtComponentScores(scores);
    }
    groupFindingsByCategory(findings) {
        return fmtGroupedFindings(findings);
    }
    findingStatistics(findings) {
        return fmtFindingStats(findings);
    }
    recommendationStatistics(recommendations) {
        return fmtRecStats(recommendations);
    }
    getTopRecommendations(recs, limit = 5) {
        return fmtTopRecommendations(recs, limit);
    }
    getTopFindings(findings, limit = 10) {
        return fmtTopFindings(findings, limit);
    }
    formatFindingsForDisplay(findings, maxPerSev = 3) {
        return fmtFindingsDisplay(findings, maxPerSev);
    }
    escapeCsvField(field) {
        return escapeCsvField(field);
    }
    buildCsvLine(values) {
        return buildCsvLine(values);
    }
    formatDuration(ms) {
        return fmtDuration(ms);
    }
    getColorForValue(value, goodThreshold = 80, warningThreshold = 60) {
        return colorForValue(value, goodThreshold, warningThreshold);
    }
    getColorForSeverity(severity) {
        return colorForSeverity(severity);
    }
    getStatusIcon(status) {
        return statusIcon(status);
    }
    getGradeColor(grade) {
        return gradeColor(grade);
    }
    calculatePercentChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }
    formatPercentage(value, precision = 1) {
        return `${value.toFixed(precision)}%`;
    }
    formatMetricName(metricName) {
        return metricName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, s => s.toUpperCase())
            .trim();
    }
}
