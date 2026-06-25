/**
 * Status, severity and visual formatting utilities
 */
export function formatSeverity(severity) {
    return severity.toUpperCase();
}
export function formatStatus(status) {
    const map = {
        pass: { text: 'PASS', color: 'green', icon: '✓' },
        fail: { text: 'FAIL', color: 'red', icon: '✗' },
        warning: { text: 'WARNING', color: 'yellow', icon: '⚠' },
    };
    return map[status] || { text: 'UNKNOWN', color: 'gray', icon: '?' };
}
export function formatStatusWithIcon(status) {
    const map = {
        pass: { icon: '✓', color: 'green', text: 'PASS' },
        fail: { icon: '✗', color: 'red', text: 'FAIL' },
        warning: { icon: '⚠', color: 'yellow', text: 'WARNING' },
        critical: { icon: '✗', color: 'red', text: 'CRITICAL' },
        high: { icon: '!', color: 'red', text: 'HIGH' },
        medium: { icon: '⚠', color: 'yellow', text: 'MEDIUM' },
        low: { icon: '•', color: 'blue', text: 'LOW' },
        info: { icon: 'ℹ', color: 'cyan', text: 'INFO' },
    };
    return (map[status.toLowerCase()] || {
        icon: '?',
        color: 'gray',
        text: 'UNKNOWN',
    });
}
export function formatTrend(current, previous) {
    if (current > previous)
        return '↑';
    if (current < previous)
        return '↓';
    return '→';
}
export function formatMetricDisplayName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}
export function formatBar(value, width = 20, filledChar = '█', emptyChar = '░') {
    const filled = Math.round((value / 100) * width);
    const empty = width - filled;
    return `[${filledChar.repeat(filled)}${emptyChar.repeat(empty)}]`;
}
export function formatSparkline(values, width = 10) {
    if (!values.length)
        return '';
    const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values
        .slice(Math.max(0, values.length - width))
        .map(v => {
        const idx = Math.round(((v - min) / range) * (chars.length - 1));
        return chars[idx];
    })
        .join('');
}
