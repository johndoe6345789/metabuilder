/**
 * Sanitization utilities for findings and recommendations
 */
import { validateFileLocation } from './validators-core.js';
export function sanitizeFinding(finding) {
    const validSev = ['critical', 'high', 'medium', 'low', 'info'];
    return {
        ...finding,
        severity: (validSev.includes(finding.severity)
            ? finding.severity
            : 'medium'),
        title: finding.title?.trim() || 'Unknown Issue',
        description: finding.description?.trim() || '',
        remediation: finding.remediation?.trim() || 'No remediation provided',
        location: validateFileLocation(finding.location)
            ? finding.location
            : undefined,
    };
}
export function sanitizeRecommendation(rec) {
    const validPri = ['critical', 'high', 'medium', 'low'];
    const validEff = ['high', 'medium', 'low'];
    return {
        ...rec,
        priority: (validPri.includes(rec.priority)
            ? rec.priority
            : 'medium'),
        issue: rec.issue?.trim() || 'Unknown Issue',
        remediation: rec.remediation?.trim() || '',
        estimatedEffort: (validEff.includes(rec.estimatedEffort)
            ? rec.estimatedEffort
            : 'medium'),
        expectedImpact: rec.expectedImpact?.trim() || '',
    };
}
