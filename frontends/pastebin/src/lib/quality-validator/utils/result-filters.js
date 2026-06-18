const SEVERITY_ORDER = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
};
const PRIORITY_ORDER = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
};
export function countFindingsBySeverity(findings) {
    const counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
    };
    for (const f of findings) {
        if (counts[f.severity] !== undefined)
            counts[f.severity]++;
    }
    return counts;
}
export function countRecommendationsByPriority(recommendations) {
    const counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    };
    for (const r of recommendations) {
        if (counts[r.priority] !== undefined)
            counts[r.priority]++;
    }
    return counts;
}
export function groupFindingsByCategory(findings) {
    const grouped = {};
    for (const finding of findings) {
        if (!grouped[finding.category]) {
            grouped[finding.category] = [];
        }
        grouped[finding.category].push(finding);
    }
    return grouped;
}
export function sortFindingsBySeverity(findings) {
    return [...findings].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 999) - (SEVERITY_ORDER[b.severity] ?? 999));
}
export function sortRecommendationsByPriority(recommendations) {
    return [...recommendations].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 999) - (PRIORITY_ORDER[b.priority] ?? 999));
}
export function getTopFindings(findings, limit = 10) {
    return sortFindingsBySeverity(findings).slice(0, limit);
}
export function getTopRecommendations(recommendations, limit = 5) {
    return sortRecommendationsByPriority(recommendations).slice(0, limit);
}
export function getCriticalFindings(findings) {
    return findings.filter(f => f.severity === 'critical' || f.severity === 'high');
}
export function getLowPriorityFindings(findings) {
    return findings.filter(f => f.severity === 'low' || f.severity === 'info');
}
