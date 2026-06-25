/**
 * Score and grade formatting utilities
 */
export function formatScore(score, precision = 1) {
    return `${score.toFixed(precision)}%`;
}
export function formatPercentage(value, precision = 1) {
    return `${value.toFixed(precision)}%`;
}
export function formatPercentageChange(current, previous, precision = 1) {
    const change = current - previous;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(precision)}%`;
}
export function formatGrade(grade) {
    return String(grade).toUpperCase();
}
export function getGradeDescription(grade) {
    const descriptions = {
        A: 'Excellent',
        B: 'Good',
        C: 'Acceptable',
        D: 'Poor',
        F: 'Failing',
    };
    return descriptions[grade.toUpperCase()] || 'Unknown';
}
export function formatNumber(value, precision) {
    const formatted = precision !== undefined ? value.toFixed(precision) : value.toString();
    return parseFloat(formatted).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: precision,
    });
}
export function formatLargeNumber(value) {
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
export function formatMetric(value, unit, precision = 2) {
    return `${value.toFixed(precision)}${unit}`;
}
