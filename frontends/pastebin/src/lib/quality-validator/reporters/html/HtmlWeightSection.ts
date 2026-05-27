/**
 * HTML scoring weight visualization section
 */

import { ScoringResult } from '../../types/index.js';

export function generateWeightVisualization(
  result: ScoringResult
): string {
  const weights = result.metadata.configUsed.scoring?.weights;
  if (!weights) return '';

  const bar = (w: number) =>
    `<div class="score-bar">` +
    `<div class="score-fill" style="width: ${w * 100}%"></div>` +
    `</div>`;

  const row = (label: string, w: number) =>
    `<div class="metric">` +
    `<div class="metric-label">${label}</div>` +
    bar(w) +
    `<div class="metric-value">${(w * 100).toFixed(1)}%</div>` +
    `</div>`;

  return (
    `<section class="section">` +
    `<h2>Scoring Weights</h2>` +
    `<div class="card">` +
    `<h3>Component Contribution to Overall Score</h3>` +
    `<div class="metrics-grid">` +
    row('Code Quality', weights.codeQuality) +
    row('Test Coverage', weights.testCoverage) +
    row('Architecture', weights.architecture) +
    row('Security', weights.security) +
    `</div></div></section>`
  );
}
