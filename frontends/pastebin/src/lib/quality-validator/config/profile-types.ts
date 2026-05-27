/**
 * Profile type definitions and built-in profiles
 */

import { ConfigurationError } from '../types/index.js';

export type ProfileName = 'strict' | 'moderate' | 'lenient' | 'custom';
export type EnvironmentType = 'dev' | 'staging' | 'production';

export interface ProfileDefinition {
  name: string;
  description: string;
  weights: {
    codeQuality: number;
    testCoverage: number;
    architecture: number;
    security: number;
  };
  minimumScores: {
    codeQuality: number;
    testCoverage: number;
    architecture: number;
    security: number;
  };
  thresholds?: {
    complexity?: { max?: number; warning?: number };
    coverage?: { minimum?: number; warning?: number };
    duplication?: { maxPercent?: number; warningPercent?: number };
  };
}

export interface ProfilesConfig {
  [key: string]: ProfileDefinition;
}

export const BUILT_IN_PROFILES: ProfilesConfig = {
  strict: {
    name: 'strict',
    description: 'Enterprise grade - highest standards',
    weights: {
      codeQuality: 0.35,
      testCoverage: 0.4,
      architecture: 0.15,
      security: 0.1,
    },
    minimumScores: {
      codeQuality: 90,
      testCoverage: 85,
      architecture: 85,
      security: 95,
    },
    thresholds: {
      complexity: { max: 10, warning: 8 },
      coverage: { minimum: 85, warning: 75 },
      duplication: { maxPercent: 2, warningPercent: 1 },
    },
  },
  moderate: {
    name: 'moderate',
    description: 'Standard production quality',
    weights: {
      codeQuality: 0.3,
      testCoverage: 0.35,
      architecture: 0.2,
      security: 0.15,
    },
    minimumScores: {
      codeQuality: 80,
      testCoverage: 70,
      architecture: 80,
      security: 85,
    },
    thresholds: {
      complexity: { max: 15, warning: 12 },
      coverage: { minimum: 70, warning: 60 },
      duplication: { maxPercent: 5, warningPercent: 3 },
    },
  },
  lenient: {
    name: 'lenient',
    description: 'Development/experimentation - relaxed standards',
    weights: {
      codeQuality: 0.25,
      testCoverage: 0.3,
      architecture: 0.25,
      security: 0.2,
    },
    minimumScores: {
      codeQuality: 70,
      testCoverage: 60,
      architecture: 70,
      security: 75,
    },
    thresholds: {
      complexity: { max: 20, warning: 15 },
      coverage: { minimum: 60, warning: 40 },
      duplication: { maxPercent: 8, warningPercent: 5 },
    },
  },
};

/** Load and parse a profiles JSON file */
export function loadProfilesFromFile(
  filePath: string
): ProfilesConfig {
  // Import is synchronous via fs — require to stay Node-compatible
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (typeof data !== 'object' || data === null) {
      throw new ConfigurationError(
        `Invalid profiles file: ${filePath}`,
        'Profiles must be a JSON object'
      );
    }
    return data as ProfilesConfig;
  } catch (err) {
    if (err instanceof ConfigurationError) throw err;
    if (err instanceof SyntaxError) {
      throw new ConfigurationError(
        `Invalid JSON in profiles file: ${filePath}`,
        (err as Error).message
      );
    }
    throw new ConfigurationError(
      `Failed to read profiles file: ${filePath}`,
      (err as Error).message
    );
  }
}
