/**
 * HTML Report Styling Module
 * Handles all embedded CSS for HTML reports with responsive design
 */

import { COLOR_SCHEME } from '../../utils/constants.js';

/**
 * Generate all embedded CSS styles for HTML reports
 *
 * @returns {string} Complete CSS stylesheet as string
 *
 * @description
 * Returns comprehensive CSS with:
 * - Reset and base styles
 * - Layout and typography
 * - Component styling
 * - Responsive design
 * - Color schemes
 * - Animation effects
 */
export function getStyles(): string {
  return `
${getResetStyles()}
${getLayoutStyles()}
${getTypographyStyles()}
${getHeaderStyles()}
${getCardStyles()}
${getScoreStyles()}
${getMetricsStyles()}
${getFindingsStyles()}
${getRecommendationStyles()}
${getTrendStyles()}
${getFooterStyles()}
${getResponsiveStyles()}
${getAnimationStyles()}
  `;
}

function getResetStyles(): string {
  return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

html {
  scroll-behavior: smooth;
}
  `;
}

function getLayoutStyles(): string {
  return `
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.main {
  padding: 20px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  margin-bottom: 20px;
  font-size: 1.5em;
  color: #333;
  border-bottom: 2px solid ${COLOR_SCHEME.PRIMARY};
  padding-bottom: 10px;
}

.section h3 {
  margin-bottom: 15px;
  font-size: 1.2em;
  color: #555;
}
  `;
}

function getTypographyStyles(): string {
  return `
h1 {
  font-size: 2em;
  margin-bottom: 10px;
}

h2 {
  font-size: 1.5em;
  margin-bottom: 15px;
}

h3 {
  font-size: 1.2em;
  margin-bottom: 10px;
}

h4 {
  font-size: 1.05em;
  margin-bottom: 8px;
}

p {
  margin-bottom: 10px;
}

strong {
  font-weight: 600;
}

code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.95em;
}

pre {
  background: #f4f4f4;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 15px;
}

pre code {
  background: none;
  padding: 0;
}

a {
  color: ${COLOR_SCHEME.PRIMARY};
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
  `;
}

function getHeaderStyles(): string {
  return `
.header {
  background: linear-gradient(135deg, ${COLOR_SCHEME.PRIMARY} 0%, ${COLOR_SCHEME.SECONDARY} 100%);
  color: white;
  padding: 40px 20px;
  margin-bottom: 30px;
}

.header-content h1 {
  font-size: 2em;
  margin-bottom: 10px;
}

.project-name, .timestamp {
  opacity: 0.9;
  font-size: 0.95em;
  margin: 5px 0;
}
  `;
}

function getCardStyles(): string {
  return `
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.overall-card {
  padding: 40px;
}

.score-card {
  padding: 25px;
  border-left: 4px solid #ddd;
}

.score-card.score-pass {
  border-left-color: ${COLOR_SCHEME.SUCCESS};
}

.score-card.score-warning {
  border-left-color: ${COLOR_SCHEME.WARNING};
}

.score-card.score-fail {
  border-left-color: ${COLOR_SCHEME.DANGER};
}

.score-card h3 {
  margin-bottom: 15px;
  color: #333;
}
  `;
}

function getScoreStyles(): string {
  return `
.overall-score {
  display: flex;
  align-items: center;
  gap: 30px;
}

.grade {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3em;
  font-weight: bold;
  color: white;
}

.grade-pass {
  background: linear-gradient(135deg, ${COLOR_SCHEME.PRIMARY} 0%, ${COLOR_SCHEME.SECONDARY} 100%);
}

.grade-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.grade-fail {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.grade-letter {
  display: block;
}

.grade-info h2 {
  margin: 0 0 10px 0;
  color: ${COLOR_SCHEME.PRIMARY};
  border-bottom: none;
  padding-bottom: 0;
}

.grade-info p {
  margin: 5px 0;
}

.status {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
}

.status.pass {
  background: #d4edda;
  color: #155724;
}

.status.fail {
  background: #f8d7da;
  color: #721c24;
}

.status.warning {
  background: #fff3cd;
  color: #856404;
}
  `;
}

function getMetricsStyles(): string {
  return `
.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.score-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, ${COLOR_SCHEME.PRIMARY} 0%, ${COLOR_SCHEME.SECONDARY} 100%);
  transition: width 0.3s ease;
}

.score-value {
  font-size: 1.2em;
  font-weight: bold;
  color: ${COLOR_SCHEME.PRIMARY};
}

.score-value span {
  font-size: 0.8em;
  opacity: 0.7;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.metric {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid ${COLOR_SCHEME.PRIMARY};
}

.metric-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 1.3em;
  font-weight: bold;
  color: #333;
}
  `;
}

function getFindingsStyles(): string {
  return `
.findings-container {
  display: grid;
  gap: 30px;
}

.findings-group h3 {
  padding: 10px 15px;
  border-radius: 4px;
  color: white;
  margin-bottom: 15px;
}

.severity-critical {
  background: ${COLOR_SCHEME.DANGER};
}

.severity-high {
  background: #fd7e14;
}

.severity-medium {
  background: ${COLOR_SCHEME.WARNING};
  color: #333;
}

.severity-low {
  background: ${COLOR_SCHEME.INFO};
}

.severity-info {
  background: #6c757d;
}

.finding {
  padding: 15px;
  border-left: 4px solid #ddd;
  margin-bottom: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.finding-critical {
  border-left-color: ${COLOR_SCHEME.DANGER};
}

.finding-high {
  border-left-color: #fd7e14;
}

.finding-medium {
  border-left-color: ${COLOR_SCHEME.WARNING};
}

.finding-low {
  border-left-color: ${COLOR_SCHEME.INFO};
}

.finding h4 {
  margin-bottom: 8px;
  color: #333;
}

.finding p {
  margin: 8px 0;
}

.location {
  color: ${COLOR_SCHEME.PRIMARY};
  font-size: 0.9em;
}

.remediation {
  background: white;
  padding: 8px;
  border-radius: 3px;
  margin-top: 10px;
  font-size: 0.95em;
}

.more-findings {
  color: #666;
  font-style: italic;
}

.no-findings {
  padding: 20px;
  text-align: center;
  color: #155724;
  font-size: 1.1em;
  background: #d4edda;
  border-radius: 4px;
}
  `;
}

function getRecommendationStyles(): string {
  return `
.recommendations-list {
  display: grid;
  gap: 20px;
}

.recommendation {
  padding: 20px;
  border-radius: 6px;
  background: white;
  border-left: 4px solid #ddd;
}

.recommendation-critical {
  border-left-color: ${COLOR_SCHEME.DANGER};
}

.recommendation-high {
  border-left-color: #fd7e14;
}

.recommendation-medium {
  border-left-color: ${COLOR_SCHEME.WARNING};
}

.recommendation-low {
  border-left-color: ${COLOR_SCHEME.INFO};
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.recommendation h3 {
  margin: 0;
}

.priority {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.85em;
  font-weight: bold;
  color: white;
}

.priority.critical {
  background: ${COLOR_SCHEME.DANGER};
}

.priority.high {
  background: #fd7e14;
}

.priority.medium {
  background: ${COLOR_SCHEME.WARNING};
  color: #333;
}

.priority.low {
  background: ${COLOR_SCHEME.INFO};
}

.effort {
  margin-top: 10px;
  font-size: 0.9em;
  color: #666;
}
  `;
}

function getTrendStyles(): string {
  return `
.trend-card {
  font-size: 1.1em;
}

.trend-card p {
  margin: 10px 0;
}

.positive {
  color: ${COLOR_SCHEME.SUCCESS};
  font-weight: bold;
}

.negative {
  color: ${COLOR_SCHEME.DANGER};
  font-weight: bold;
}

.trend-chart {
  height: 200px;
  margin: 20px 0;
}
  `;
}

function getFooterStyles(): string {
  return `
.footer {
  background: #f5f5f5;
  padding: 20px;
  text-align: center;
  color: #666;
  border-top: 1px solid #ddd;
  margin-top: 40px;
}

.footer-meta {
  font-size: 0.9em;
  color: #999;
  margin-top: 10px;
}
  `;
}

function getResponsiveStyles(): string {
  return `
@media (max-width: 1024px) {
  .container {
    max-width: 100%;
  }

  .overall-score {
    flex-direction: column;
    align-items: flex-start;
  }

  .scores-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .header {
    padding: 30px 15px;
  }

  .header-content h1 {
    font-size: 1.5em;
  }

  .main {
    padding: 15px;
  }

  .section {
    margin-bottom: 30px;
  }

  .section h2 {
    font-size: 1.2em;
  }

  .card {
    padding: 15px;
  }

  .overall-card {
    padding: 20px;
  }

  .overall-score {
    flex-direction: column;
    align-items: stretch;
  }

  .grade {
    width: 100px;
    height: 100px;
    font-size: 2.5em;
  }

  .scores-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .recommendation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .priority {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .main {
    padding: 10px;
  }

  .section {
    margin-bottom: 20px;
  }

  .section h2 {
    font-size: 1.1em;
  }

  .card {
    padding: 12px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .grade {
    width: 80px;
    height: 80px;
    font-size: 2em;
  }

  .grade-info h2 {
    font-size: 1.3em;
  }
}
  `;
}

function getAnimationStyles(): string {
  return `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section {
  animation: slideIn 0.3s ease-out;
}

.card {
  animation: fadeIn 0.2s ease-out;
}
  `;
}
