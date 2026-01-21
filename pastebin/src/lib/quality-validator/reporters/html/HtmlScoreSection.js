/**
 * HTML Report Score Section Module
 * Generates the overall score display, grade visualization, and scoring details
 */
import { formatScore } from '../../utils/formatters.js';
/**
 * Generate the overall score section
 *
 * @param {OverallScore} overall - Overall score information
 * @returns {string} HTML section with grade circle and score details
 *
 * @description
 * Creates a prominent display containing:
 * - Large circular grade indicator (A-F)
 * - Numeric score
 * - Status badge
 * - Summary text
 */
export function generateOverallSection(overall) {
    const gradeClass = getGradeClass(overall.grade);
    return `<section class="section">
  <div class="card overall-card">
    <div class="overall-score">
      <div class="grade ${gradeClass}">
        <span class="grade-letter">${overall.grade}</span>
      </div>
      <div class="grade-info">
        <h2>${formatScore(overall.score)}</h2>
        <p>${overall.summary}</p>
        <p class="status ${overall.status}">${overall.status.toUpperCase()}</p>
      </div>
    </div>
  </div>
</section>`;
}
/**
 * Generate component scores grid
 *
 * @param {ComponentScores} componentScores - Component scores with weights
 * @returns {string} HTML section with score cards
 *
 * @description
 * Creates a grid of cards showing:
 * - Code Quality score and weight
 * - Test Coverage score and weight
 * - Architecture score and weight
 * - Security score and weight
 * Each with visual progress bar
 */
export function generateComponentScoresSection(componentScores) {
    const components = [
        {
            name: 'Code Quality',
            score: componentScores.codeQuality.score,
            weight: componentScores.codeQuality.weight,
        },
        {
            name: 'Test Coverage',
            score: componentScores.testCoverage.score,
            weight: componentScores.testCoverage.weight,
        },
        {
            name: 'Architecture',
            score: componentScores.architecture.score,
            weight: componentScores.architecture.weight,
        },
        {
            name: 'Security',
            score: componentScores.security.score,
            weight: componentScores.security.weight,
        },
    ];
    let scoresHtml = '<section class="section"><h2>Component Scores</h2><div class="scores-grid">';
    for (const component of components) {
        scoresHtml += generateScoreCard(component.name, component.score, component.weight);
    }
    scoresHtml += '</div></section>';
    return scoresHtml;
}
/**
 * Generate a single score card
 *
 * @param {string} name - Component name
 * @param {number} score - Score value (0-100)
 * @param {number} weight - Weight as decimal (0-1)
 * @returns {string} HTML score card
 *
 * @description
 * Creates a card with:
 * - Component name as title
 * - Visual progress bar
 * - Numeric score and weight
 * - Color coding based on score level
 */
export function generateScoreCard(name, score, weight) {
    const scoreClass = getScoreClass(score);
    return `
    <div class="card score-card ${scoreClass}">
      <h3>${name}</h3>
      <div class="score-bar">
        <div class="score-fill" style="width: ${score}%"></div>
      </div>
      <p class="score-value">${formatScore(score)} <span>(${(weight * 100).toFixed(0)}%)</span></p>
    </div>`;
}
/**
 * Generate summary statistics section
 *
 * @param {OverallScore} overall - Overall score data
 * @param {ComponentScores} componentScores - Component scores
 * @returns {string} HTML section with statistics
 *
 * @description
 * Displays summary metrics including:
 * - Highest scoring component
 * - Lowest scoring component
 * - Pass/fail status
 * - Grade summary
 */
export function generateSummaryStatistics(overall, componentScores) {
    const components = [
        { name: 'Code Quality', score: componentScores.codeQuality.score },
        { name: 'Test Coverage', score: componentScores.testCoverage.score },
        { name: 'Architecture', score: componentScores.architecture.score },
        { name: 'Security', score: componentScores.security.score },
    ];
    const highest = components.reduce((a, b) => (a.score > b.score ? a : b));
    const lowest = components.reduce((a, b) => (a.score < b.score ? a : b));
    return `<section class="section">
  <h2>Summary</h2>
  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-label">Highest Component</div>
      <div class="metric-value">${highest.name}</div>
      <small>${formatScore(highest.score)}</small>
    </div>
    <div class="metric">
      <div class="metric-label">Lowest Component</div>
      <div class="metric-value">${lowest.name}</div>
      <small>${formatScore(lowest.score)}</small>
    </div>
    <div class="metric">
      <div class="metric-label">Overall Grade</div>
      <div class="metric-value">${overall.grade}</div>
      <small>Status: ${overall.status.toUpperCase()}</small>
    </div>
  </div>
</section>`;
}
/**
 * Get CSS class for grade styling
 *
 * @param {string} grade - Letter grade (A-F)
 * @returns {string} CSS class name
 *
 * @description
 * Maps grades to styling classes:
 * - A, B → 'grade-pass' (blue)
 * - C, D → 'grade-warning' (orange)
 * - F → 'grade-fail' (red)
 */
function getGradeClass(grade) {
    if (grade === 'A' || grade === 'B')
        return 'grade-pass';
    if (grade === 'C' || grade === 'D')
        return 'grade-warning';
    return 'grade-fail';
}
/**
 * Get CSS class for score styling
 *
 * @param {number} score - Score value
 * @returns {string} CSS class name
 *
 * @description
 * Maps score ranges to styling classes:
 * - 80+ → 'score-pass' (green)
 * - 60-79 → 'score-warning' (yellow)
 * - <60 → 'score-fail' (red)
 */
function getScoreClass(score) {
    if (score >= 80)
        return 'score-pass';
    if (score >= 60)
        return 'score-warning';
    return 'score-fail';
}
