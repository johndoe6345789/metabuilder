/**
 * Formatting utilities for consistent output across reporters
 * Centralizes all formatting logic to reduce duplication
 */
import { SEVERITY_ORDER } from './constants.js';
/**
 * Format a numeric score as a percentage string
 *
 * @param {number} score - The score value (0-100)
 * @param {number} [precision=1] - Number of decimal places
 * @returns {string} Formatted score with percentage symbol
 *
 * @example
 * formatScore(85.567, 1) // Returns: "85.6%"
 * formatScore(92) // Returns: "92.0%"
 */
export function formatScore(score, precision = 1) {
    return `${score.toFixed(precision)}%`;
}
/**
 * Format severity level for consistent display
 *
 * @param {Severity} severity - The severity level
 * @returns {string} Formatted severity with uppercase and padding
 *
 * @example
 * formatSeverity('high') // Returns: "HIGH"
 * formatSeverity('info') // Returns: "INFO"
 */
export function formatSeverity(severity) {
    return severity.toUpperCase();
}
/**
 * Format file location for display in reports
 *
 * @param {FileLocation} location - The file location object
 * @returns {string} Formatted location string
 *
 * @example
 * formatFileLocation({ file: 'src/app.ts', line: 45 })
 * // Returns: "src/app.ts:45"
 */
export function formatFileLocation(location) {
    if (!location)
        return '';
    const { file, line, column } = location;
    if (line && column) {
        return `${file}:${line}:${column}`;
    }
    return line ? `${file}:${line}` : file;
}
/**
 * Format a Finding for display in various report formats
 *
 * @param {Finding} finding - The finding to format
 * @returns {string} Formatted finding text
 *
 * @example
 * const finding = {
 *   title: 'High complexity',
 *   description: 'Function has complexity > 20',
 *   remediation: 'Refactor into smaller functions'
 * };
 * formatFinding(finding);
 * // Returns formatted text representation
 */
export function formatFinding(finding) {
    const lines = [];
    lines.push(`[${formatSeverity(finding.severity)}] ${finding.title}`);
    lines.push(`Description: ${finding.description}`);
    if (finding.location) {
        lines.push(`Location: ${formatFileLocation(finding.location)}`);
    }
    if (finding.remediation) {
        lines.push(`Remediation: ${finding.remediation}`);
    }
    if (finding.evidence) {
        lines.push(`Evidence: ${finding.evidence}`);
    }
    return lines.join('\n');
}
/**
 * Format a Recommendation for display
 *
 * @param {Recommendation} rec - The recommendation to format
 * @param {number} [index=0] - Optional index for numbering
 * @returns {string} Formatted recommendation text
 *
 * @example
 * const rec = {
 *   priority: 'high',
 *   issue: 'Low test coverage',
 *   remediation: 'Add more tests',
 *   estimatedEffort: 'high',
 *   expectedImpact: 'Improved reliability'
 * };
 * formatRecommendation(rec, 1);
 */
export function formatRecommendation(rec, index = 0) {
    const lines = [];
    if (index > 0) {
        lines.push(`${index}. ${rec.issue}`);
    }
    else {
        lines.push(rec.issue);
    }
    lines.push(`   Priority: ${rec.priority.toUpperCase()}`);
    lines.push(`   Remediation: ${rec.remediation}`);
    lines.push(`   Effort: ${rec.estimatedEffort} | Impact: ${rec.expectedImpact}`);
    return lines.join('\n');
}
/**
 * Format a metric value with appropriate unit and precision
 *
 * @param {number} value - The metric value
 * @param {string} unit - The unit label (e.g., '%', 'ms', 'lines')
 * @param {number} [precision=2] - Decimal places
 * @returns {string} Formatted metric string
 *
 * @example
 * formatMetric(92.5, '%') // Returns: "92.50%"
 * formatMetric(1234.567, 'ms', 1) // Returns: "1234.6ms"
 */
export function formatMetric(value, unit, precision = 2) {
    return `${value.toFixed(precision)}${unit}`;
}
/**
 * Format a duration in milliseconds as human-readable time
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 *
 * @example
 * formatDuration(1500) // Returns: "1.5s"
 * formatDuration(250) // Returns: "250ms"
 */
export function formatDuration(ms) {
    if (ms >= 1000) {
        return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
}
/**
 * Format a file size in bytes as human-readable size
 *
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 *
 * @example
 * formatFileSize(1024) // Returns: "1.0KB"
 * formatFileSize(1048576) // Returns: "1.0MB"
 */
export function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)}${units[unitIndex]}`;
}
/**
 * Sort findings by severity level
 *
 * @param {Finding[]} findings - Array of findings to sort
 * @returns {Finding[]} Sorted findings (critical → info)
 *
 * @example
 * const findings = [
 *   { severity: 'info', ... },
 *   { severity: 'critical', ... },
 *   { severity: 'medium', ... }
 * ];
 * const sorted = sortFindingsBySeverity(findings);
 * // Returns: [critical, medium, info]
 */
export function sortFindingsBySeverity(findings) {
    return [...findings].sort((a, b) => {
        const aOrder = SEVERITY_ORDER[a.severity];
        const bOrder = SEVERITY_ORDER[b.severity];
        return aOrder - bOrder;
    });
}
/**
 * Group findings by severity level
 *
 * @param {Finding[]} findings - Array of findings to group
 * @returns {Record<string, Finding[]>} Findings grouped by severity
 *
 * @example
 * const findings = [...];
 * const grouped = groupFindingsBySeverity(findings);
 * // Returns: { critical: [...], high: [...], medium: [...], ... }
 */
export function groupFindingsBySeverity(findings) {
    const grouped = {
        critical: [],
        high: [],
        medium: [],
        low: [],
        info: [],
    };
    for (const finding of findings) {
        if (grouped[finding.severity]) {
            grouped[finding.severity].push(finding);
        }
    }
    return grouped;
}
/**
 * Truncate text to maximum length with ellipsis
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} [suffix='...'] - Suffix to append when truncated
 * @returns {string} Truncated text
 *
 * @example
 * truncateText('This is a very long text', 10)
 * // Returns: "This is..."
 */
export function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
}
/**
 * Escape HTML special characters for safe rendering
 *
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 */
export function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}
/**
 * Format a status value with color coding suggestion
 *
 * @param {string} status - Status value ('pass', 'fail', 'warning')
 * @returns {object} Object with status and suggested color
 *
 * @example
 * formatStatus('pass')
 * // Returns: { text: 'PASS', color: 'green', icon: '✓' }
 */
export function formatStatus(status) {
    const statusMap = {
        pass: { text: 'PASS', color: 'green', icon: '✓' },
        fail: { text: 'FAIL', color: 'red', icon: '✗' },
        warning: { text: 'WARNING', color: 'yellow', icon: '⚠' },
    };
    return statusMap[status] || { text: 'UNKNOWN', color: 'gray', icon: '?' };
}
/**
 * Create a data-url for inline images
 *
 * @param {string} svgContent - SVG content as string
 * @returns {string} Data URL for SVG
 *
 * @example
 * const svg = '<svg>...</svg>';
 * const dataUrl = createSvgDataUrl(svg);
 * // Returns: "data:image/svg+xml;base64,..."
 */
export function createSvgDataUrl(svgContent) {
    const encoded = Buffer.from(svgContent).toString('base64');
    return `data:image/svg+xml;base64,${encoded}`;
}
