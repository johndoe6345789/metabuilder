/**
 * Pure calculation helpers for RulesScoringIntegration
 */
export function calculateAdjustment(violations, config) {
    let adj = 0;
    adj += (violations.critical || 0) * config.severityWeights.critical;
    adj += (violations.warning || 0) * config.severityWeights.warning;
    adj += (violations.info || 0) * config.severityWeights.info;
    return Math.max(adj, config.maxPenalty);
}
export function adjustComponentScores(cs, adjustment) {
    const totalWeight = cs.codeQuality.weight +
        cs.testCoverage.weight +
        cs.architecture.weight +
        cs.security.weight;
    function adj(score, w) {
        return Math.max(0, score + (adjustment * w) / totalWeight);
    }
    return {
        codeQuality: {
            ...cs.codeQuality,
            score: adj(cs.codeQuality.score, cs.codeQuality.weight),
            weightedScore: adj(cs.codeQuality.weightedScore, cs.codeQuality.weight),
        },
        testCoverage: {
            ...cs.testCoverage,
            score: adj(cs.testCoverage.score, cs.testCoverage.weight),
            weightedScore: adj(cs.testCoverage.weightedScore, cs.testCoverage.weight),
        },
        architecture: {
            ...cs.architecture,
            score: adj(cs.architecture.score, cs.architecture.weight),
            weightedScore: adj(cs.architecture.weightedScore, cs.architecture.weight),
        },
        security: {
            ...cs.security,
            score: adj(cs.security.score, cs.security.weight),
            weightedScore: adj(cs.security.weightedScore, cs.security.weight),
        },
    };
}
export function calcAdjustedOverall(cs) {
    return (cs.codeQuality.weightedScore +
        cs.testCoverage.weightedScore +
        cs.architecture.weightedScore +
        cs.security.weightedScore);
}
export function assignGrade(score) {
    if (score >= 90)
        return 'A';
    if (score >= 80)
        return 'B';
    if (score >= 70)
        return 'C';
    if (score >= 60)
        return 'D';
    return 'F';
}
export function buildSummary(grade, score) {
    const desc = {
        A: 'Excellent code quality - exceeds expectations',
        B: 'Good code quality - meets expectations',
        C: 'Acceptable code quality - areas for improvement',
        D: 'Poor code quality - significant issues',
        F: 'Failing code quality - critical issues',
    };
    return `${desc[grade] || 'Unknown'} (${score.toFixed(1)}%)`;
}
export function buildAdjustmentReason(violations, adjustment) {
    const parts = [];
    if ((violations.critical || 0) > 0) {
        parts.push(`${violations.critical} critical violation(s)`);
    }
    if ((violations.warning || 0) > 0) {
        parts.push(`${violations.warning} warning(s)`);
    }
    if ((violations.info || 0) > 0) {
        parts.push(`${violations.info} info(s)`);
    }
    // eslint-disable-next-line max-len
    return `Custom rules: ${parts.join(', ')} (${adjustment.toFixed(1)} point adjustment)`;
}
export function violationsToFindings(violations) {
    const severityMap = {
        critical: 'critical',
        warning: 'high',
        info: 'low',
    };
    return violations.map(v => ({
        id: `custom-rule-${v.ruleId}`,
        severity: severityMap[v.severity],
        category: 'codeQuality',
        title: v.ruleName,
        description: v.message,
        location: v.file
            ? { file: v.file, line: v.line, column: v.column }
            : undefined,
        remediation: `Fix violation of rule: ${v.ruleName}`,
        evidence: v.evidence,
        moreInfo: `Custom rule ID: ${v.ruleId}`,
        affectedItems: 1,
    }));
}
