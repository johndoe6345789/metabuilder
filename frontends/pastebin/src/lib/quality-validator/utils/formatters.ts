/**
 * Formatting utilities for consistent output across reporters
 * Centralizes all formatting logic to reduce duplication
 */

import { Finding, Recommendation, FileLocation, Severity } from '../types/index.js';
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
export function formatScore(score: number, precision: number = 1): string {
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
export function formatSeverity(severity: Severity): string {
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
export function formatFileLocation(location: FileLocation): string {
  if (!location) return '';
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
export function formatFinding(finding: Finding): string {
  const lines: string[] = [];

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
export function formatRecommendation(rec: Recommendation, index: number = 0): string {
  const lines: string[] = [];

  if (index > 0) {
    lines.push(`${index}. ${rec.issue}`);
  } else {
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
export function formatMetric(value: number, unit: string, precision: number = 2): string {
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
export function formatDuration(ms: number): string {
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
export function formatFileSize(bytes: number): string {
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
export function sortFindingsBySeverity(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const aOrder = SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER];
    const bOrder = SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER];
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
export function groupFindingsBySeverity(findings: Finding[]): Record<Severity, Finding[]> {
  const grouped: Record<Severity, Finding[]> = {
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
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
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
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
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
export function formatStatus(status: string): { text: string; color: string; icon: string } {
  const statusMap: Record<string, { text: string; color: string; icon: string }> = {
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
export function createSvgDataUrl(svgContent: string): string {
  const encoded = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

// ============================================================================
// GRADE FORMATTING
// ============================================================================

/**
 * Format grade letter with visual representation
 *
 * @param {string} grade - Grade letter (A-F)
 * @returns {string} Formatted grade string
 *
 * @example
 * formatGrade('A') // Returns: "A"
 * formatGrade('F') // Returns: "F"
 */
export function formatGrade(grade: string): string {
  return String(grade).toUpperCase();
}

/**
 * Get grade description text
 *
 * @param {string} grade - Grade letter
 * @returns {string} Human-readable grade description
 *
 * @example
 * getGradeDescription('A') // Returns: "Excellent"
 * getGradeDescription('C') // Returns: "Acceptable"
 */
export function getGradeDescription(grade: string): string {
  const descriptions: Record<string, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Acceptable',
    D: 'Poor',
    F: 'Failing',
  };
  return descriptions[grade.toUpperCase()] || 'Unknown';
}

/**
 * Format number with thousand separators
 *
 * @param {number} value - Number to format
 * @param {number} precision - Decimal places
 * @returns {string} Formatted number string
 *
 * @example
 * formatNumber(1234567.89, 2) // Returns: "1,234,567.89"
 * formatNumber(42) // Returns: "42"
 */
export function formatNumber(value: number, precision?: number): string {
  const formatted = precision !== undefined ? value.toFixed(precision) : value.toString();
  return parseFloat(formatted).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}

/**
 * Format percentage with consistent styling and precision
 *
 * @param {number} value - Percentage value (0-100)
 * @param {number} precision - Decimal places
 * @returns {string} Formatted percentage string
 *
 * @example
 * formatPercentage(85.567, 1) // Returns: "85.6%"
 * formatPercentage(100) // Returns: "100%"
 */
export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Format percentage with change indicator
 *
 * @param {number} current - Current percentage
 * @param {number} previous - Previous percentage
 * @param {number} precision - Decimal places
 * @returns {string} Formatted percentage with change
 *
 * @example
 * formatPercentageChange(90, 85, 1) // Returns: "+5.0%"
 * formatPercentageChange(80, 85, 1) // Returns: "-5.0%"
 */
export function formatPercentageChange(current: number, previous: number, precision: number = 1): string {
  const change = current - previous;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(precision)}%`;
}

/**
 * Format large number in short form (K, M, B)
 *
 * @param {number} value - Number to format
 * @returns {string} Formatted short number
 *
 * @example
 * formatLargeNumber(1234) // Returns: "1.2K"
 * formatLargeNumber(1234567) // Returns: "1.2M"
 */
export function formatLargeNumber(value: number): string {
  const units = ['', 'K', 'M', 'B', 'T'];
  let unitIndex = 0;
  let num = Math.abs(value);

  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }

  const sign = value < 0 ? '-' : '';
  return `${sign}${num.toFixed(1)}${units[unitIndex]}`;
}

/**
 * Format ratio as a visual bar chart
 *
 * @param {number} value - Value (0-100)
 * @param {number} width - Width of bar in characters
 * @param {string} filledChar - Character for filled portion
 * @param {string} emptyChar - Character for empty portion
 * @returns {string} Visual bar representation
 *
 * @example
 * formatBar(75, 20) // Returns: "███████████████░░░░"
 */
export function formatBar(
  value: number,
  width: number = 20,
  filledChar: string = '█',
  emptyChar: string = '░'
): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return `[${filledChar.repeat(filled)}${emptyChar.repeat(empty)}]`;
}

/**
 * Format sparkline from data points
 *
 * @param {number[]} values - Data points
 * @param {number} width - Width of sparkline (max points)
 * @returns {string} ASCII sparkline representation
 *
 * @example
 * formatSparkline([1, 3, 5, 4, 6, 8, 7, 9, 8, 10])
 * // Returns: "▁▃▅▄▆█▇█▇█"
 */
export function formatSparkline(values: number[], width: number = 10): string {
  if (values.length === 0) return '';

  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .slice(Math.max(0, values.length - width))
    .map((v) => {
      const index = Math.round(((v - min) / range) * (chars.length - 1));
      return chars[index];
    })
    .join('');
}

/**
 * Format trend indicator (arrow or symbol)
 *
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} Trend indicator symbol
 *
 * @example
 * formatTrend(90, 85) // Returns: "↑"
 * formatTrend(80, 85) // Returns: "↓"
 * formatTrend(85, 85) // Returns: "→"
 */
export function formatTrend(current: number, previous: number): string {
  if (current > previous) return '↑';
  if (current < previous) return '↓';
  return '→';
}

/**
 * Format status with icon
 *
 * @param {string} status - Status value
 * @returns {object} Formatted status with icon and color
 *
 * @example
 * formatStatusWithIcon('pass')
 * // Returns: { icon: '✓', color: 'green' }
 */
export function formatStatusWithIcon(
  status: string
): {
  icon: string;
  color: string;
  text: string;
} {
  const statusMap: Record<string, { icon: string; color: string; text: string }> = {
    pass: { icon: '✓', color: 'green', text: 'PASS' },
    fail: { icon: '✗', color: 'red', text: 'FAIL' },
    warning: { icon: '⚠', color: 'yellow', text: 'WARNING' },
    critical: { icon: '✗', color: 'red', text: 'CRITICAL' },
    high: { icon: '!', color: 'red', text: 'HIGH' },
    medium: { icon: '⚠', color: 'yellow', text: 'MEDIUM' },
    low: { icon: '•', color: 'blue', text: 'LOW' },
    info: { icon: 'ℹ', color: 'cyan', text: 'INFO' },
  };
  return statusMap[status.toLowerCase()] || { icon: '?', color: 'gray', text: 'UNKNOWN' };
}

/**
 * Format metric name for display
 *
 * @param {string} name - Metric name in camelCase or snake_case
 * @returns {string} Formatted metric name for display
 *
 * @example
 * formatMetricDisplayName('cyclomaticComplexity')
 * // Returns: "Cyclomatic Complexity"
 */
export function formatMetricDisplayName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Insert space before capitals
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format time duration with appropriate units
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Human-readable duration
 *
 * @example
 * formatTime(3661000) // Returns: "1h 1m 1s"
 * formatTime(65000) // Returns: "1m 5s"
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Pad text to fixed width
 *
 * @param {string} text - Text to pad
 * @param {number} width - Target width
 * @param {string} padChar - Character to pad with
 * @param {boolean} padLeft - Pad on left (true) or right (false)
 * @returns {string} Padded text
 *
 * @example
 * padText('test', 8, ' ', false) // Returns: "test    "
 * padText('42', 5, '0', true) // Returns: "00042"
 */
export function padText(
  text: string,
  width: number,
  padChar: string = ' ',
  padLeft: boolean = false
): string {
  const padding = Math.max(0, width - text.length);
  const padString = padChar.repeat(padding);
  return padLeft ? padString + text : text + padString;
}

/**
 * Format list of items as human-readable string
 *
 * @param {string[]} items - Items to format
 * @param {string} separator - Item separator
 * @param {string} finalSeparator - Separator before last item
 * @returns {string} Formatted list
 *
 * @example
 * formatList(['apple', 'banana', 'cherry'])
 * // Returns: "apple, banana, and cherry"
 */
export function formatList(
  items: string[],
  separator: string = ', ',
  finalSeparator: string = ', and '
): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}${finalSeparator}${items[1]}`;

  return items.slice(0, -1).join(separator) + finalSeparator + items[items.length - 1];
}
