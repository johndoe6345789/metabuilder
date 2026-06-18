/**
 * HTML Report Score Section Module
 */
import { formatScore } from '../../utils/formatters.js';
function gradeClass(g) {
    if (g === 'A' || g === 'B')
        return 'grade-pass';
    if (g === 'C' || g === 'D')
        return 'grade-warning';
    return 'grade-fail';
}
function scoreClass(s) {
    if (s >= 80)
        return 'score-pass';
    if (s >= 60)
        return 'score-warning';
    return 'score-fail';
}
export function generateOverallSection(overall) {
    return (`<section class="section"><div class="card overall-card">` +
        `<div class="overall-score">` +
        `<div class="grade ${gradeClass(overall.grade)}">` +
        `<span class="grade-letter">${overall.grade}</span></div>` +
        `<div class="grade-info"><h2>${formatScore(overall.score)}</h2>` +
        `<p>${overall.summary}</p>` +
        `<p class="status ${overall.status}">${overall.status.toUpperCase()}</p>` +
        `</div></div></div></section>`);
}
export function generateScoreCard(name, score, weight) {
    return (`<div class="card score-card ${scoreClass(score)}">` +
        `<h3>${name}</h3>` +
        `<div class="score-bar">` +
        `<div class="score-fill" style="width: ${score}%"></div></div>` +
        `<p class="score-value">${formatScore(score)} ` +
        `<span>(${(weight * 100).toFixed(0)}%)</span></p></div>`);
}
export function generateComponentScoresSection(cs) {
    const cards = [
        generateScoreCard('Code Quality', cs.codeQuality.score, cs.codeQuality.weight),
        generateScoreCard('Test Coverage', cs.testCoverage.score, cs.testCoverage.weight),
        generateScoreCard('Architecture', cs.architecture.score, cs.architecture.weight),
        generateScoreCard('Security', cs.security.score, cs.security.weight),
    ].join('');
    return (`<section class="section"><h2>Component Scores</h2>` +
        `<div class="scores-grid">${cards}</div></section>`);
}
export function generateSummaryStatistics(overall, cs) {
    const comps = [
        { name: 'Code Quality', score: cs.codeQuality.score },
        { name: 'Test Coverage', score: cs.testCoverage.score },
        { name: 'Architecture', score: cs.architecture.score },
        { name: 'Security', score: cs.security.score },
    ];
    const hi = comps.reduce((a, b) => (a.score > b.score ? a : b));
    const lo = comps.reduce((a, b) => (a.score < b.score ? a : b));
    const metric = (label, val, sub) => `<div class="metric"><div class="metric-label">${label}</div>` +
        `<div class="metric-value">${val}</div><small>${sub}</small></div>`;
    return (`<section class="section"><h2>Summary</h2>` +
        `<div class="metrics-grid">` +
        metric('Highest Component', hi.name, formatScore(hi.score)) +
        metric('Lowest Component', lo.name, formatScore(lo.score)) +
        metric('Overall Grade', overall.grade, `Status: ${overall.status.toUpperCase()}`) +
        `</div></section>`);
}
