export function calculateWeightedScore(scores) {
    return (scores.codeQuality.weightedScore +
        scores.testCoverage.weightedScore +
        scores.architecture.weightedScore +
        scores.security.weightedScore);
}
export function scoreToGrade(score) {
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
export function determineStatus(score, threshold) {
    return score >= threshold ? 'pass' : 'fail';
}
export function generateSummary(score, category = 'Overall') {
    const quality = score >= 90
        ? 'excellent'
        : score >= 80
            ? 'good'
            : score >= 70
                ? 'acceptable'
                : 'poor';
    return `${category} score of ${score.toFixed(1)} is ${quality}`;
}
export function calculateScoreChange(current, previous) {
    return current - previous;
}
export function determineTrend(current, previous, threshold = 2) {
    const change = current - previous;
    if (Math.abs(change) < threshold)
        return 'stable';
    return change > 0 ? 'improving' : 'degrading';
}
export function calculateAverageComponentScore(scores) {
    const values = [
        scores.codeQuality.score,
        scores.testCoverage.score,
        scores.architecture.score,
        scores.security.score,
    ];
    return values.reduce((a, b) => a + b, 0) / values.length;
}
export function getScoreExtremes(scores) {
    const components = [
        { name: 'codeQuality', score: scores.codeQuality.score },
        { name: 'testCoverage', score: scores.testCoverage.score },
        { name: 'architecture', score: scores.architecture.score },
        { name: 'security', score: scores.security.score },
    ].sort((a, b) => a.score - b.score);
    return {
        lowest: components[0],
        highest: components[components.length - 1],
    };
}
export function generateMetricsSummary(result) {
    return {
        overallScore: result.overall.score.toFixed(1),
        grade: result.overall.grade,
        status: result.overall.status,
        findingsCount: result.findings.length,
        criticalFindings: result.findings.filter(f => f.severity === 'critical')
            .length,
        highFindings: result.findings.filter(f => f.severity === 'high').length,
        recommendationsCount: result.recommendations.length,
        analysisTime: `${result.metadata.analysisTime.toFixed(2)}ms`,
    };
}
