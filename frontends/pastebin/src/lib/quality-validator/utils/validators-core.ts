/**
 * Core validators for findings, recommendations, and scores
 */

import type { Finding, FileLocation, Recommendation } from '../types/index.js';

export { validateScoringResult, validateConfiguration } from './validators-result.js';

export function validateScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

export function validateFileLocation(
  location: FileLocation | undefined
): boolean {
  if (!location) return true;
  if (typeof location.file !== 'string' || location.file.length === 0) {
    return false;
  }
  if (
    location.line !== undefined &&
    (typeof location.line !== 'number' || location.line < 0)
  ) return false;
  if (
    location.column !== undefined &&
    (typeof location.column !== 'number' || location.column < 0)
  ) return false;
  return true;
}

export function validateFinding(finding: Finding): string[] {
  const errors: string[] = [];
  if (!finding.id || typeof finding.id !== 'string') {
    errors.push('Finding must have a valid id');
  }
  if (
    !finding.severity ||
    !['critical', 'high', 'medium', 'low', 'info'].includes(finding.severity)
  ) {
    errors.push('Finding must have a valid severity');
  }
  if (!finding.title || typeof finding.title !== 'string') {
    errors.push('Finding must have a valid title');
  }
  if (!finding.description || typeof finding.description !== 'string') {
    errors.push('Finding must have a valid description');
  }
  if (!finding.remediation || typeof finding.remediation !== 'string') {
    errors.push('Finding must have a valid remediation');
  }
  if (finding.location && !validateFileLocation(finding.location)) {
    errors.push('Finding has invalid file location');
  }
  return errors;
}

export function validateRecommendation(r: Recommendation): string[] {
  const errors: string[] = [];
  if (!r.priority || !['critical', 'high', 'medium', 'low'].includes(r.priority)) {
    errors.push('Recommendation must have a valid priority');
  }
  if (!r.issue || typeof r.issue !== 'string') {
    errors.push('Recommendation must have a valid issue');
  }
  if (!r.remediation || typeof r.remediation !== 'string') {
    errors.push('Recommendation must have a valid remediation');
  }
  if (
    !r.estimatedEffort ||
    !['high', 'medium', 'low'].includes(r.estimatedEffort)
  ) {
    errors.push('Recommendation must have a valid estimatedEffort');
  }
  if (!r.expectedImpact || typeof r.expectedImpact !== 'string') {
    errors.push('Recommendation must have a valid expectedImpact');
  }
  return errors;
}
