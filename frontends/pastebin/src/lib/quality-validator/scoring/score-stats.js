/**
 * Statistical scoring utilities
 */
/**
 * Calculate percentile ranking of a score
 */
export function scorePercentile(score, allScores) {
    if (allScores.length === 0)
        return 0;
    const below = allScores.filter(s => s < score).length;
    return (below / allScores.length) * 100;
}
/**
 * Normalize a value from its original range to 0-100
 */
export function normalizeScore(value, min, max) {
    if (max === min)
        return 100;
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}
/**
 * Calculate impact of a score delta given a weight
 */
export function calculateScoreImpact(scoreDelta, weight) {
    return scoreDelta * weight;
}
/**
 * Generate a score summary string
 */
export function generateScoreSummary(score, target = 80) {
    if (score >= target) {
        // eslint-disable-next-line max-len
        return `Excellent! Score of ${score.toFixed(1)} exceeds target of ${target}.`;
    }
    const gap = target - score;
    return (`Current: ${score.toFixed(1)}/100. ` +
        `Need ${gap.toFixed(1)} more points to reach target of ${target}.`);
}
/**
 * Return true if the absolute score change is >= threshold
 */
export function isSignificantChange(current, previous, threshold = 5) {
    return Math.abs(current - previous) >= threshold;
}
/**
 * Project future score using linear regression on historical scores
 */
export function projectScore(historicalScores, periods) {
    if (historicalScores.length < 2) {
        return historicalScores[historicalScores.length - 1] || 50;
    }
    const changes = [];
    for (let i = 1; i < historicalScores.length; i++) {
        changes.push(historicalScores[i] - historicalScores[i - 1]);
    }
    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    const currentScore = historicalScores[historicalScores.length - 1];
    return Math.max(0, Math.min(100, currentScore + avgChange * periods));
}
