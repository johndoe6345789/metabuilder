/**
 * Score and grade formatting utilities
 */

export function formatScore(score: number, precision = 1): string {
  return `${score.toFixed(precision)}%`;
}

export function formatPercentage(value: number, precision = 1): string {
  return `${value.toFixed(precision)}%`;
}

export function formatPercentageChange(
  current: number,
  previous: number,
  precision = 1
): string {
  const change = current - previous;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(precision)}%`;
}

export function formatGrade(grade: string): string {
  return String(grade).toUpperCase();
}

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

export function formatNumber(value: number, precision?: number): string {
  const formatted =
    precision !== undefined ? value.toFixed(precision) : value.toString();
  return parseFloat(formatted).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}

export function formatLargeNumber(value: number): string {
  const units = ['', 'K', 'M', 'B', 'T'];
  let idx = 0;
  let num = Math.abs(value);
  while (num >= 1000 && idx < units.length - 1) {
    num /= 1000;
    idx++;
  }
  const sign = value < 0 ? '-' : '';
  return `${sign}${num.toFixed(1)}${units[idx]}`;
}

export function formatMetric(
  value: number,
  unit: string,
  precision = 2
): string {
  return `${value.toFixed(precision)}${unit}`;
}
