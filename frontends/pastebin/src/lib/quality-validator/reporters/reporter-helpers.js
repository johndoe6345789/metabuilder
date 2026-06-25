/**
 * Shared helper utilities used by all reporters
 */
import { groupFindingsBySeverity } from '../utils/formatters.js';
export { escapeCsvField, buildCsvLine, fmtDuration, colorForValue, colorForSeverity, statusIcon, gradeColor, } from './reporter-helpers-fmt.js';
export function fmtMetadata(metadata) {
    return {
        timestamp: metadata.timestamp,
        projectPath: metadata.projectPath,
        nodeVersion: metadata.nodeVersion,
        analysisTime: metadata.analysisTime,
        toolVersion: metadata.toolVersion,
        projectName: metadata.configUsed.projectName || 'snippet-pastebin',
    };
}
export function fmtOverallScore(overall) {
    return {
        score: overall.score.toFixed(1),
        grade: overall.grade,
        status: overall.status,
        summary: overall.summary,
        passesThresholds: overall.passesThresholds,
    };
}
export function fmtComponentScores(scores) {
    const fmt = (s) => ({
        score: s.score.toFixed(1),
        weight: (s.weight * 100).toFixed(0),
        weightedScore: s.weightedScore.toFixed(1),
    });
    return {
        codeQuality: fmt(scores.codeQuality),
        testCoverage: fmt(scores.testCoverage),
        architecture: fmt(scores.architecture),
        security: fmt(scores.security),
    };
}
export function fmtFindingStats(findings) {
    const stats = {
        total: findings.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
    };
    for (const f of findings) {
        if (stats[f.severity] !== undefined)
            stats[f.severity]++;
    }
    return stats;
}
export function fmtRecStats(recs) {
    const stats = {
        total: recs.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    };
    for (const r of recs) {
        if (stats[r.priority] !== undefined)
            stats[r.priority]++;
    }
    return stats;
}
export function fmtTopRecommendations(recs, limit = 5) {
    const order = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };
    return [...recs]
        .sort((a, b) => (order[a.priority] ?? 999) - (order[b.priority] ?? 999))
        .slice(0, limit);
}
export function fmtTopFindings(findings, limit = 10) {
    const order = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
    };
    return [...findings]
        .sort((a, b) => (order[a.severity] ?? 999) - (order[b.severity] ?? 999))
        .slice(0, limit);
}
export function fmtFindingsDisplay(findings, maxPerSev = 3) {
    const grouped = groupFindingsBySeverity(findings);
    const result = {};
    for (const [sev, sevFindings] of Object.entries(grouped)) {
        if (!sevFindings.length)
            continue;
        result[sev] = {
            count: sevFindings.length,
            displayed: sevFindings.slice(0, maxPerSev),
            remaining: Math.max(0, sevFindings.length - maxPerSev),
        };
    }
    return result;
}
export function fmtGroupedFindings(findings) {
    const grouped = groupFindingsBySeverity(findings);
    const result = {};
    for (const [sev, sevFindings] of Object.entries(grouped)) {
        result[sev] = { count: sevFindings.length, findings: sevFindings };
    }
    return result;
}
