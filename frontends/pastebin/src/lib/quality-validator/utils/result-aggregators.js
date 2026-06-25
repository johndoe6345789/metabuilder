/**
 * Result aggregation utilities — merging and deduplication
 */
export function aggregateFindings(findingsArrays) {
    const seenIds = new Set();
    const merged = [];
    for (const findings of findingsArrays) {
        for (const finding of findings) {
            if (!seenIds.has(finding.id)) {
                seenIds.add(finding.id);
                merged.push(finding);
            }
        }
    }
    return merged;
}
export function deduplicateFindings(findings) {
    const seenIds = new Set();
    return findings.filter(f => {
        if (seenIds.has(f.id))
            return false;
        seenIds.add(f.id);
        return true;
    });
}
export function deduplicateRecommendations(recommendations) {
    const seen = new Set();
    return recommendations.filter(rec => {
        const key = `${rec.priority}:${rec.issue}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
export function mergeFindingsArrays(arrays) {
    return deduplicateFindings(aggregateFindings(arrays));
}
export function mergeRecommendationsArrays(arrays) {
    return deduplicateRecommendations(arrays.flat());
}
export function extractMetricsFromResults(results) {
    const metrics = {};
    for (const result of results) {
        metrics[result.category] = result.metrics;
    }
    return metrics;
}
export function extractFindingsFromResults(results) {
    return mergeFindingsArrays(results.map(r => r.findings));
}
export function extractExecutionTimes(results) {
    const times = {};
    for (const result of results) {
        times[result.category] = result.executionTime;
    }
    return times;
}
export function calculateTotalExecutionTime(results) {
    return results.reduce((sum, r) => sum + r.executionTime, 0);
}
