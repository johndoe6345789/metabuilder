import type { Finding, Recommendation } from '../types/index.js';

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function countFindingsBySeverity(
  findings: Finding[]
): Record<string, number> {
  const counts: Record<string, number> = {
    critical: 0, high: 0, medium: 0, low: 0, info: 0,
  };
  for (const f of findings) {
    if (counts[f.severity] !== undefined) counts[f.severity]++;
  }
  return counts;
}

export function countRecommendationsByPriority(
  recommendations: Recommendation[]
): Record<string, number> {
  const counts: Record<string, number> = {
    critical: 0, high: 0, medium: 0, low: 0,
  };
  for (const r of recommendations) {
    if (counts[r.priority] !== undefined) counts[r.priority]++;
  }
  return counts;
}

export function groupFindingsByCategory(
  findings: Finding[]
): Record<string, Finding[]> {
  const grouped: Record<string, Finding[]> = {};
  for (const finding of findings) {
    if (!grouped[finding.category]) {
      grouped[finding.category] = [];
    }
    grouped[finding.category].push(finding);
  }
  return grouped;
}

export function sortFindingsBySeverity(
  findings: Finding[]
): Finding[] {
  return [...findings].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 999) -
      (SEVERITY_ORDER[b.severity] ?? 999)
  );
}

export function sortRecommendationsByPriority(
  recommendations: Recommendation[]
): Recommendation[] {
  return [...recommendations].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 999) -
      (PRIORITY_ORDER[b.priority] ?? 999)
  );
}

export function getTopFindings(
  findings: Finding[],
  limit = 10
): Finding[] {
  return sortFindingsBySeverity(findings).slice(0, limit);
}

export function getTopRecommendations(
  recommendations: Recommendation[],
  limit = 5
): Recommendation[] {
  return sortRecommendationsByPriority(recommendations).slice(0, limit);
}

export function getCriticalFindings(findings: Finding[]): Finding[] {
  return findings.filter(
    (f) => f.severity === 'critical' || f.severity === 'high'
  );
}

export function getLowPriorityFindings(findings: Finding[]): Finding[] {
  return findings.filter(
    (f) => f.severity === 'low' || f.severity === 'info'
  );
}
