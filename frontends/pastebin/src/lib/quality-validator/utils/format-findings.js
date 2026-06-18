/**
 * Finding and recommendation formatting utilities
 */
import { SEVERITY_ORDER } from './constants.js';
export function formatFileLocation(location) {
    if (!location)
        return '';
    const { file, line, column } = location;
    if (line && column)
        return `${file}:${line}:${column}`;
    return line ? `${file}:${line}` : file;
}
export function formatFinding(finding) {
    const lines = [];
    lines.push(`[${finding.severity.toUpperCase()}] ${finding.title}`);
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
export function formatRecommendation(rec, index = 0) {
    const lines = [];
    lines.push(index > 0 ? `${index}. ${rec.issue}` : rec.issue);
    lines.push(`   Priority: ${rec.priority.toUpperCase()}`);
    lines.push(`   Remediation: ${rec.remediation}`);
    lines.push(`   Effort: ${rec.estimatedEffort} | Impact: ${rec.expectedImpact}`);
    return lines.join('\n');
}
export function sortFindingsBySeverity(findings) {
    return [...findings].sort((a, b) => {
        const aOrder = SEVERITY_ORDER[a.severity];
        const bOrder = SEVERITY_ORDER[b.severity];
        return aOrder - bOrder;
    });
}
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
