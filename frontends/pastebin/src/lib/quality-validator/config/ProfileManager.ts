/**
 * Profile Manager for Quality Validator
 * Manages built-in and custom quality profiles with environment-specific support
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationError } from '../types/index.js';

// ============================================================================
// PROFILE TYPES
// ============================================================================

export type ProfileName = 'strict' | 'moderate' | 'lenient' | 'custom';
export type EnvironmentType = 'dev' | 'staging' | 'production';

/**
 * Profile definition with thresholds and weights
 */
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
    complexity?: {
      max?: number;
      warning?: number;
    };
    coverage?: {
      minimum?: number;
      warning?: number;
    };
    duplication?: {
      maxPercent?: number;
      warningPercent?: number;
    };
  };
}

/**
 * Complete profiles configuration file structure
 */
export interface ProfilesConfig {
  [key: string]: ProfileDefinition;
}

// ============================================================================
// BUILT-IN PROFILES
// ============================================================================

const BUILT_IN_PROFILES: ProfilesConfig = {
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
      complexity: {
        max: 10,
        warning: 8,
      },
      coverage: {
        minimum: 85,
        warning: 75,
      },
      duplication: {
        maxPercent: 2,
        warningPercent: 1,
      },
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
      complexity: {
        max: 15,
        warning: 12,
      },
      coverage: {
        minimum: 70,
        warning: 60,
      },
      duplication: {
        maxPercent: 5,
        warningPercent: 3,
      },
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
      complexity: {
        max: 20,
        warning: 15,
      },
      coverage: {
        minimum: 60,
        warning: 40,
      },
      duplication: {
        maxPercent: 8,
        warningPercent: 5,
      },
    },
  },
};

// ============================================================================
// PROFILE MANAGER CLASS
// ============================================================================

export class ProfileManager {
  private static instance: ProfileManager;
  private profiles: Map<string, ProfileDefinition> = new Map();
  private customProfilesPath: string = '.quality/profiles.json';
  private environmentProfilesPath: Map<EnvironmentType, string> = new Map([
    ['dev', '.quality/profiles.dev.json'],
    ['staging', '.quality/profiles.staging.json'],
    ['production', '.quality/profiles.prod.json'],
  ]);
  private currentProfile: ProfileName = 'moderate';
  private currentEnvironment: EnvironmentType = this.detectEnvironment();

  private constructor() {
    // Initialize built-in profiles
    for (const [name, profile] of Object.entries(BUILT_IN_PROFILES)) {
      this.profiles.set(name, profile);
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  /**
   * Initialize the profile manager by loading custom and environment profiles
   */
  async initialize(): Promise<void> {
    // Load environment-specific profile if it exists
    const envProfilePath = this.environmentProfilesPath.get(this.currentEnvironment);
    if (envProfilePath && fs.existsSync(envProfilePath)) {
      try {
        const envProfiles = this.loadProfilesFromFile(envProfilePath);
        for (const [name, profile] of Object.entries(envProfiles)) {
          this.profiles.set(`${name}-${this.currentEnvironment}`, profile);
        }
      } catch (error) {
        console.warn(`Failed to load environment profiles from ${envProfilePath}:`, error);
      }
    }

    // Load custom profiles if they exist
    if (fs.existsSync(this.customProfilesPath)) {
      try {
        const customProfiles = this.loadProfilesFromFile(this.customProfilesPath);
        for (const [name, profile] of Object.entries(customProfiles)) {
          this.profiles.set(name, profile);
        }
      } catch (error) {
        console.warn(`Failed to load custom profiles from ${this.customProfilesPath}:`, error);
      }
    }
  }

  /**
   * Load profiles from a JSON file
   */
  private loadProfilesFromFile(filePath: string): ProfilesConfig {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (typeof data !== 'object' || data === null) {
        throw new ConfigurationError(
          `Invalid profiles file format: ${filePath}`,
          'Profiles must be a JSON object'
        );
      }

      return data as ProfilesConfig;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new ConfigurationError(
          `Invalid JSON in profiles file: ${filePath}`,
          (error as Error).message
        );
      }
      throw new ConfigurationError(
        `Failed to read profiles file: ${filePath}`,
        (error as Error).message
      );
    }
  }

  /**
   * Get a profile by name
   */
  getProfile(name: string): ProfileDefinition {
    const profile = this.profiles.get(name);
    if (!profile) {
      throw new ConfigurationError(
        `Profile not found: ${name}`,
        `Available profiles: ${Array.from(this.profiles.keys()).join(', ')}`
      );
    }
    return JSON.parse(JSON.stringify(profile));
  }

  /**
   * Get all available profile names
   */
  getAllProfileNames(): string[] {
    return Array.from(this.profiles.keys());
  }

  /**
   * Get all available profiles
   */
  getAllProfiles(): ProfileDefinition[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Set the current active profile
   */
  setCurrentProfile(name: string): void {
    if (!this.profiles.has(name)) {
      throw new ConfigurationError(
        `Cannot set profile: ${name} not found`,
        `Available profiles: ${Array.from(this.profiles.keys()).join(', ')}`
      );
    }
    this.currentProfile = name as ProfileName;
  }

  /**
   * Get the current active profile
   */
  getCurrentProfile(): ProfileDefinition {
    return this.getProfile(this.currentProfile);
  }

  /**
   * Get the current profile name
   */
  getCurrentProfileName(): string {
    return this.currentProfile;
  }

  /**
   * Create a new custom profile
   */
  createProfile(
    name: string,
    definition: ProfileDefinition,
    saveToFile: boolean = true
  ): ProfileDefinition {
    // Validate profile definition
    this.validateProfile(definition);

    // Check for duplicate names
    if (this.profiles.has(name)) {
      throw new ConfigurationError(
        `Profile already exists: ${name}`,
        'Use a different name or delete the existing profile'
      );
    }

    // Store in memory
    this.profiles.set(name, definition);

    // Save to file if requested
    if (saveToFile) {
      this.saveProfileToFile(name, definition);
    }

    return definition;
  }

  /**
   * Update an existing profile
   */
  updateProfile(
    name: string,
    updates: Partial<ProfileDefinition>,
    saveToFile: boolean = true
  ): ProfileDefinition {
    const existingProfile = this.getProfile(name);
    const updated = { ...existingProfile, ...updates };

    // Validate updated profile
    this.validateProfile(updated);

    // Update in memory
    this.profiles.set(name, updated);

    // Save to file if requested
    if (saveToFile) {
      this.saveProfileToFile(name, updated);
    }

    return updated;
  }

  /**
   * Delete a custom profile
   */
  deleteProfile(name: string, deleteFromFile: boolean = true): void {
    // Prevent deletion of built-in profiles
    if (BUILT_IN_PROFILES.hasOwnProperty(name)) {
      throw new ConfigurationError(
        `Cannot delete built-in profile: ${name}`,
        'Only custom profiles can be deleted'
      );
    }

    if (!this.profiles.has(name)) {
      throw new ConfigurationError(
        `Profile not found: ${name}`,
        `Available profiles: ${Array.from(this.profiles.keys()).join(', ')}`
      );
    }

    // Remove from memory
    this.profiles.delete(name);

    // Remove from file if requested
    if (deleteFromFile) {
      this.removeProfileFromFile(name);
    }
  }

  /**
   * Check if a profile is built-in
   */
  isBuiltInProfile(name: string): boolean {
    return BUILT_IN_PROFILES.hasOwnProperty(name);
  }

  /**
   * Validate a profile definition
   */
  private validateProfile(profile: ProfileDefinition): void {
    // Validate weights
    const weights = profile.weights;
    const sum = weights.codeQuality + weights.testCoverage + weights.architecture + weights.security;

    if (Math.abs(sum - 1.0) > 0.001) {
      throw new ConfigurationError(
        'Profile weights must sum to 1.0',
        `Got: ${sum.toFixed(4)}. Weights: ${JSON.stringify(weights)}`
      );
    }

    // Validate minimum scores are between 0 and 100
    const scores = profile.minimumScores;
    for (const [key, value] of Object.entries(scores)) {
      if (value < 0 || value > 100) {
        throw new ConfigurationError(
          `Invalid minimum score for ${key}: ${value}`,
          'Minimum scores must be between 0 and 100'
        );
      }
    }

    // Validate thresholds if present
    if (profile.thresholds) {
      if (profile.thresholds.complexity) {
        const { max, warning } = profile.thresholds.complexity;
        if (max !== undefined && warning !== undefined && warning > max) {
          throw new ConfigurationError(
            'Complexity warning threshold must be less than max',
            `Warning: ${warning}, Max: ${max}`
          );
        }
      }

      if (profile.thresholds.duplication) {
        const { maxPercent, warningPercent } = profile.thresholds.duplication;
        if (maxPercent !== undefined && warningPercent !== undefined && warningPercent > maxPercent) {
          throw new ConfigurationError(
            'Duplication warning threshold must be less than max',
            `Warning: ${warningPercent}%, Max: ${maxPercent}%`
          );
        }
      }
    }
  }

  /**
   * Save a profile to the custom profiles file
   */
  private saveProfileToFile(name: string, profile: ProfileDefinition): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.customProfilesPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Load existing profiles
      let profiles: ProfilesConfig = {};
      if (fs.existsSync(this.customProfilesPath)) {
        const content = fs.readFileSync(this.customProfilesPath, 'utf-8');
        profiles = JSON.parse(content);
      }

      // Add/update the profile
      profiles[name] = profile;

      // Write back to file
      fs.writeFileSync(this.customProfilesPath, JSON.stringify(profiles, null, 2));
    } catch (error) {
      throw new ConfigurationError(
        `Failed to save profile to ${this.customProfilesPath}`,
        (error as Error).message
      );
    }
  }

  /**
   * Remove a profile from the custom profiles file
   */
  private removeProfileFromFile(name: string): void {
    try {
      if (!fs.existsSync(this.customProfilesPath)) {
        return;
      }

      const content = fs.readFileSync(this.customProfilesPath, 'utf-8');
      const profiles = JSON.parse(content) as ProfilesConfig;

      delete profiles[name];

      fs.writeFileSync(this.customProfilesPath, JSON.stringify(profiles, null, 2));
    } catch (error) {
      throw new ConfigurationError(
        `Failed to remove profile from ${this.customProfilesPath}`,
        (error as Error).message
      );
    }
  }

  /**
   * Detect current environment from NODE_ENV
   */
  private detectEnvironment(): EnvironmentType {
    const nodeEnv: string = process.env.NODE_ENV || 'dev';
    if (nodeEnv.includes('production') || nodeEnv === 'prod') {
      return 'production';
    }
    if (nodeEnv.includes('staging') || nodeEnv === 'stage') {
      return 'staging';
    }
    return 'dev';
  }

  /**
   * Get the current environment
   */
  getCurrentEnvironment(): EnvironmentType {
    return this.currentEnvironment;
  }

  /**
   * Set the environment
   */
  setEnvironment(environment: EnvironmentType): void {
    this.currentEnvironment = environment;
  }

  /**
   * Get profiles for a specific environment
   */
  getEnvironmentProfiles(environment: EnvironmentType): ProfileDefinition[] {
    const results: ProfileDefinition[] = [];
    for (const [name, profile] of this.profiles) {
      if (name.endsWith(`-${environment}`)) {
        results.push(profile);
      }
    }
    return results;
  }

  /**
   * Export profile as JSON string
   */
  exportProfile(name: string): string {
    const profile = this.getProfile(name);
    return JSON.stringify(profile, null, 2);
  }

  /**
   * Import a profile from JSON string
   */
  importProfile(name: string, jsonString: string, saveToFile: boolean = true): ProfileDefinition {
    try {
      const profile = JSON.parse(jsonString);
      this.validateProfile(profile);
      return this.createProfile(name, profile, saveToFile);
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new ConfigurationError(
          'Invalid JSON in profile import',
          (error as Error).message
        );
      }
      throw error;
    }
  }

  /**
   * Get profile comparison
   */
  compareProfiles(name1: string, name2: string): Record<string, any> {
    const profile1 = this.getProfile(name1);
    const profile2 = this.getProfile(name2);

    return {
      profile1Name: name1,
      profile2Name: name2,
      weights: {
        profile1: profile1.weights,
        profile2: profile2.weights,
        differences: {
          codeQuality: Math.abs(profile1.weights.codeQuality - profile2.weights.codeQuality),
          testCoverage: Math.abs(profile1.weights.testCoverage - profile2.weights.testCoverage),
          architecture: Math.abs(profile1.weights.architecture - profile2.weights.architecture),
          security: Math.abs(profile1.weights.security - profile2.weights.security),
        },
      },
      minimumScores: {
        profile1: profile1.minimumScores,
        profile2: profile2.minimumScores,
        differences: {
          codeQuality: Math.abs(
            profile1.minimumScores.codeQuality - profile2.minimumScores.codeQuality
          ),
          testCoverage: Math.abs(
            profile1.minimumScores.testCoverage - profile2.minimumScores.testCoverage
          ),
          architecture: Math.abs(
            profile1.minimumScores.architecture - profile2.minimumScores.architecture
          ),
          security: Math.abs(profile1.minimumScores.security - profile2.minimumScores.security),
        },
      },
    };
  }
}

export const profileManager = ProfileManager.getInstance();
