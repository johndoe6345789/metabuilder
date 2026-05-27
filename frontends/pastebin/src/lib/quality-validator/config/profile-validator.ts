/**
 * Profile validation logic
 */

import { ConfigurationError } from '../types/index.js';
import type { ProfileDefinition } from './profile-types.js';

/** Validate a profile definition, throwing on errors */
export function validateProfile(profile: ProfileDefinition): void {
  const weights = profile.weights;
  const sum =
    weights.codeQuality +
    weights.testCoverage +
    weights.architecture +
    weights.security;

  if (Math.abs(sum - 1.0) > 0.001) {
    throw new ConfigurationError(
      'Profile weights must sum to 1.0',
      `Got: ${sum.toFixed(4)}. Weights: ${JSON.stringify(weights)}`
    );
  }

  for (const [key, value] of Object.entries(profile.minimumScores)) {
    if (value < 0 || value > 100) {
      throw new ConfigurationError(
        `Invalid minimum score for ${key}: ${value}`,
        'Minimum scores must be between 0 and 100'
      );
    }
  }

  if (profile.thresholds?.complexity) {
    const { max, warning } = profile.thresholds.complexity;
    if (max !== undefined && warning !== undefined && warning > max) {
      throw new ConfigurationError(
        'Complexity warning threshold must be < max',
        `Warning: ${warning}, Max: ${max}`
      );
    }
  }

  if (profile.thresholds?.duplication) {
    const { maxPercent, warningPercent } =
      profile.thresholds.duplication;
    if (
      maxPercent !== undefined &&
      warningPercent !== undefined &&
      warningPercent > maxPercent
    ) {
      throw new ConfigurationError(
        'Duplication warning threshold must be < max',
        `Warning: ${warningPercent}%, Max: ${maxPercent}%`
      );
    }
  }
}
