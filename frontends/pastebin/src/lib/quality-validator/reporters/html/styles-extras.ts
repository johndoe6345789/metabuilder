import { COLOR_SCHEME } from '../../utils/constants.js';

export function getRecommendationStyles(): string {
  return `
.recommendations-list { display: grid; gap: 20px; }
.recommendation {
  padding: 20px; border-radius: 6px;
  background: white; border-left: 4px solid #ddd;
}
.recommendation-critical {
  border-left-color: ${COLOR_SCHEME.DANGER};
}
.recommendation-high { border-left-color: #fd7e14; }
.recommendation-medium {
  border-left-color: ${COLOR_SCHEME.WARNING};
}
.recommendation-low { border-left-color: ${COLOR_SCHEME.INFO}; }
.recommendation-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 10px;
}
.recommendation h3 { margin: 0; }
.priority {
  padding: 4px 8px; border-radius: 3px;
  font-size: 0.85em; font-weight: bold; color: white;
}
.priority.critical { background: ${COLOR_SCHEME.DANGER}; }
.priority.high { background: #fd7e14; }
.priority.medium {
  background: ${COLOR_SCHEME.WARNING}; color: #333;
}
.priority.low { background: ${COLOR_SCHEME.INFO}; }
.effort { margin-top: 10px; font-size: 0.9em; color: #666; }`;
}

export function getTrendStyles(): string {
  return `
.trend-card { font-size: 1.1em; }
.trend-card p { margin: 10px 0; }
.positive { color: ${COLOR_SCHEME.SUCCESS}; font-weight: bold; }
.negative { color: ${COLOR_SCHEME.DANGER}; font-weight: bold; }
.trend-chart { height: 200px; margin: 20px 0; }`;
}

export function getResponsiveStyles(): string {
  return `
@media (max-width: 1024px) {
  .container { max-width: 100%; }
  .overall-score { flex-direction: column; align-items: flex-start; }
  .scores-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
@media (max-width: 768px) {
  .header { padding: 30px 15px; }
  .header-content h1 { font-size: 1.5em; }
  .main { padding: 15px; }
  .section { margin-bottom: 30px; }
  .section h2 { font-size: 1.2em; }
  .card { padding: 15px; }
  .overall-card { padding: 20px; }
  .overall-score { flex-direction: column; align-items: stretch; }
  .grade { width: 100px; height: 100px; font-size: 2.5em; }
  .scores-grid { grid-template-columns: 1fr; }
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .recommendation-header {
    flex-direction: column; align-items: flex-start; gap: 10px;
  }
  .priority { align-self: flex-start; }
}
@media (max-width: 480px) {
  .main { padding: 10px; }
  .section { margin-bottom: 20px; }
  .section h2 { font-size: 1.1em; }
  .card { padding: 12px; }
  .metrics-grid { grid-template-columns: 1fr; }
  .grade { width: 80px; height: 80px; font-size: 2em; }
  .grade-info h2 { font-size: 1.3em; }
}`;
}

export function getAnimationStyles(): string {
  return `
@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.section { animation: slideIn 0.3s ease-out; }
.card { animation: fadeIn 0.2s ease-out; }`;
}
