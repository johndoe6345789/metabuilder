/**
 * Formatting utilities — re-exports from focused sub-modules
 */
export { formatScore, formatPercentage, formatPercentageChange, formatGrade, getGradeDescription, formatNumber, formatLargeNumber, formatMetric, } from './format-score.js';
export { formatSeverity, formatStatus, formatStatusWithIcon, formatTrend, formatMetricDisplayName, formatBar, formatSparkline, } from './format-status.js';
export { truncateText, escapeHtml, createSvgDataUrl, padText, formatList, formatDuration, formatTime, formatFileSize, } from './format-text.js';
export { formatFileLocation, formatFinding, formatRecommendation, sortFindingsBySeverity, groupFindingsBySeverity, } from './format-findings.js';
