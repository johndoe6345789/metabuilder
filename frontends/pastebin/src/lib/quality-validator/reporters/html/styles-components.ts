/**
 * Card, score, metrics, and findings CSS styles for HTML reports
 */

import { COLOR_SCHEME } from '../../utils/constants.js';

export function getCardStyles(): string {
  return `
.card {
  background: white; border-radius: 8px; padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}
.card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.overall-card { padding: 40px; }
.score-card { padding: 25px; border-left: 4px solid #ddd; }
.score-card.score-pass { border-left-color: ${COLOR_SCHEME.SUCCESS}; }
.score-card.score-warning { border-left-color: ${COLOR_SCHEME.WARNING}; }
.score-card.score-fail { border-left-color: ${COLOR_SCHEME.DANGER}; }
.score-card h3 { margin-bottom: 15px; color: #333; }`;
}

export function getScoreStyles(): string {
  return `
.overall-score { display: flex; align-items: center; gap: 30px; }
.grade {
  width: 120px; height: 120px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 3em; font-weight: bold; color: white;
}
.grade-pass {
  background: linear-gradient(135deg,
    ${COLOR_SCHEME.PRIMARY} 0%, ${COLOR_SCHEME.SECONDARY} 100%);
}
.grade-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.grade-fail {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
.grade-letter { display: block; }
.grade-info h2 {
  margin: 0 0 10px 0; color: ${COLOR_SCHEME.PRIMARY};
  border-bottom: none; padding-bottom: 0;
}
.grade-info p { margin: 5px 0; }
.status {
  padding: 5px 10px; border-radius: 4px;
  font-weight: bold; display: inline-block;
}
.status.pass { background: #d4edda; color: #155724; }
.status.fail { background: #f8d7da; color: #721c24; }
.status.warning { background: #fff3cd; color: #856404; }`;
}

export function getMetricsStyles(): string {
  return `
.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.score-bar {
  width: 100%; height: 8px; background: #eee;
  border-radius: 4px; overflow: hidden; margin-bottom: 10px;
}
.score-fill {
  height: 100%;
  background: linear-gradient(90deg,
    ${COLOR_SCHEME.PRIMARY} 0%, ${COLOR_SCHEME.SECONDARY} 100%);
  transition: width 0.3s ease;
}
.score-value {
  font-size: 1.2em; font-weight: bold; color: ${COLOR_SCHEME.PRIMARY};
}
.score-value span { font-size: 0.8em; opacity: 0.7; }
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}
.metric {
  padding: 15px; background: #f9f9f9; border-radius: 6px;
  border-left: 3px solid ${COLOR_SCHEME.PRIMARY};
}
.metric-label { font-size: 0.9em; color: #666; margin-bottom: 5px; }
.metric-value { font-size: 1.3em; font-weight: bold; color: #333; }`;
}

export function getFindingsStyles(): string {
  return `
.findings-container { display: grid; gap: 30px; }
.findings-group h3 {
  padding: 10px 15px; border-radius: 4px;
  color: white; margin-bottom: 15px;
}
.severity-critical { background: ${COLOR_SCHEME.DANGER}; }
.severity-high { background: #fd7e14; }
.severity-medium { background: ${COLOR_SCHEME.WARNING}; color: #333; }
.severity-low { background: ${COLOR_SCHEME.INFO}; }
.severity-info { background: #6c757d; }
.finding {
  padding: 15px; border-left: 4px solid #ddd;
  margin-bottom: 15px; background: #f9f9f9; border-radius: 4px;
}
.finding-critical { border-left-color: ${COLOR_SCHEME.DANGER}; }
.finding-high { border-left-color: #fd7e14; }
.finding-medium { border-left-color: ${COLOR_SCHEME.WARNING}; }
.finding-low { border-left-color: ${COLOR_SCHEME.INFO}; }
.finding h4 { margin-bottom: 8px; color: #333; }
.finding p { margin: 8px 0; }
.location { color: ${COLOR_SCHEME.PRIMARY}; font-size: 0.9em; }
.remediation {
  background: white; padding: 8px; border-radius: 3px;
  margin-top: 10px; font-size: 0.95em;
}
.more-findings { color: #666; font-style: italic; }
.no-findings {
  padding: 20px; text-align: center; color: #155724;
  font-size: 1.1em; background: #d4edda; border-radius: 4px;
}`;
}
