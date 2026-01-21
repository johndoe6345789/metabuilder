/**
 * Tests for ProfileManager
 * Comprehensive test suite for profile loading, validation, and management
 */
import * as fs from 'fs';
import * as path from 'path';
import { ProfileManager, ProfileDefinition } from './ProfileManager';
import { ConfigurationError } from '../types/index';

describe('ProfileManager', () => {
  let profileManager: ProfileManager;
  let tempDir: string;

  beforeEach(() => {
    profileManager = ProfileManager.getInstance();
    tempDir = './.test-profiles';
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  describe('Singleton Instance', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = ProfileManager.getInstance();
      const instance2 = ProfileManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Built-in Profiles', () => {
    it('should have strict profile available', () => {
      const profile = profileManager.getProfile('strict');
      expect(profile.name).toBe('strict');
      expect(profile.weights.codeQuality).toBe(0.35);
      expect(profile.weights.testCoverage).toBe(0.4);
      expect(profile.weights.architecture).toBe(0.15);
      expect(profile.weights.security).toBe(0.1);
    });

    it('should have moderate profile available', () => {
      const profile = profileManager.getProfile('moderate');
      expect(profile.name).toBe('moderate');
      expect(profile.weights.codeQuality).toBe(0.3);
      expect(profile.weights.testCoverage).toBe(0.35);
      expect(profile.weights.architecture).toBe(0.2);
      expect(profile.weights.security).toBe(0.15);
    });

    it('should have lenient profile available', () => {
      const profile = profileManager.getProfile('lenient');
      expect(profile.name).toBe('lenient');
      expect(profile.weights.codeQuality).toBe(0.25);
      expect(profile.weights.testCoverage).toBe(0.3);
      expect(profile.weights.architecture).toBe(0.25);
      expect(profile.weights.security).toBe(0.2);
    });

    it('should have correct descriptions for profiles', () => {
      expect(profileManager.getProfile('strict').description).toContain('Enterprise');
      expect(profileManager.getProfile('moderate').description).toContain('Standard');
      expect(profileManager.getProfile('lenient').description).toContain('Development');
    });
  });

  describe('Profile Listing', () => {
    it('should list all profile names', () => {
      const names = profileManager.getAllProfileNames();
      expect(names).toContain('strict');
      expect(names).toContain('moderate');
      expect(names).toContain('lenient');
      expect(names.length).toBeGreaterThanOrEqual(3);
    });

    it('should list all profiles', () => {
      const profiles = profileManager.getAllProfiles();
      expect(profiles.length).toBeGreaterThanOrEqual(3);
      expect(profiles.some((p) => p.name === 'strict')).toBe(true);
      expect(profiles.some((p) => p.name === 'moderate')).toBe(true);
      expect(profiles.some((p) => p.name === 'lenient')).toBe(true);
    });
  });

  describe('Profile Selection', () => {
    it('should set current profile', () => {
      profileManager.setCurrentProfile('strict');
      expect(profileManager.getCurrentProfileName()).toBe('strict');
    });

    it('should get current profile', () => {
      profileManager.setCurrentProfile('moderate');
      const profile = profileManager.getCurrentProfile();
      expect(profile.name).toBe('moderate');
    });

    it('should throw error for invalid profile', () => {
      expect(() => {
        profileManager.setCurrentProfile('nonexistent');
      }).toThrow(ConfigurationError);
    });
  });

  describe('Profile Validation', () => {
    it('should validate weight sums to 1.0', () => {
      const validProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test profile',
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
      };

      // Should not throw
      profileManager.createProfile('test-valid', validProfile, false);
    });

    it('should reject profiles with invalid weights', () => {
      const invalidProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test profile',
        weights: {
          codeQuality: 0.3,
          testCoverage: 0.3,
          architecture: 0.2,
          security: 0.1, // Sums to 0.9
        },
        minimumScores: {
          codeQuality: 80,
          testCoverage: 70,
          architecture: 80,
          security: 85,
        },
      };

      expect(() => {
        profileManager.createProfile('test-invalid', invalidProfile, false);
      }).toThrow(ConfigurationError);
    });

    it('should validate minimum scores are between 0 and 100', () => {
      const invalidProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test profile',
        weights: {
          codeQuality: 0.3,
          testCoverage: 0.35,
          architecture: 0.2,
          security: 0.15,
        },
        minimumScores: {
          codeQuality: 150, // Invalid
          testCoverage: 70,
          architecture: 80,
          security: 85,
        },
      };

      expect(() => {
        profileManager.createProfile('test-invalid', invalidProfile, false);
      }).toThrow(ConfigurationError);
    });

    it('should validate complexity thresholds', () => {
      const invalidProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test profile',
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
            max: 10,
            warning: 15, // Warning > max
          },
        },
      };

      expect(() => {
        profileManager.createProfile('test-invalid', invalidProfile, false);
      }).toThrow(ConfigurationError);
    });
  });

  describe('Profile Creation', () => {
    it('should create custom profile in memory', () => {
      const customProfile: ProfileDefinition = {
        name: 'custom',
        description: 'Custom test profile',
        weights: {
          codeQuality: 0.3,
          testCoverage: 0.35,
          architecture: 0.2,
          security: 0.15,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 65,
          architecture: 75,
          security: 80,
        },
      };

      profileManager.createProfile('my-custom', customProfile, false);
      const retrieved = profileManager.getProfile('my-custom');
      expect(retrieved.name).toBe('custom');
      expect(retrieved.minimumScores.codeQuality).toBe(75);
    });

    it('should prevent duplicate profile names', () => {
      const customProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test',
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
      };

      profileManager.createProfile('duplicate-test', customProfile, false);

      expect(() => {
        profileManager.createProfile('duplicate-test', customProfile, false);
      }).toThrow(ConfigurationError);
    });

    it('should allow custom profile to be retrieved', () => {
      const customProfile: ProfileDefinition = {
        name: 'custom-query',
        description: 'Custom profile for testing',
        weights: {
          codeQuality: 0.4,
          testCoverage: 0.3,
          architecture: 0.2,
          security: 0.1,
        },
        minimumScores: {
          codeQuality: 85,
          testCoverage: 75,
          architecture: 85,
          security: 90,
        },
      };

      profileManager.createProfile('test-query', customProfile, false);
      const profile = profileManager.getProfile('test-query');
      expect(profile.weights.codeQuality).toBe(0.4);
    });
  });

  describe('Profile Update', () => {
    it('should update profile weights', () => {
      const customProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test',
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
      };

      profileManager.createProfile('update-test', customProfile, false);

      const updated = profileManager.updateProfile(
        'update-test',
        {
          weights: {
            codeQuality: 0.4,
            testCoverage: 0.3,
            architecture: 0.2,
            security: 0.1,
          },
        },
        false
      );

      expect(updated.weights.codeQuality).toBe(0.4);
    });

    it('should update profile minimum scores', () => {
      const customProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test',
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
      };

      profileManager.createProfile('score-update-test', customProfile, false);

      const updated = profileManager.updateProfile(
        'score-update-test',
        {
          minimumScores: {
            codeQuality: 85,
            testCoverage: 75,
            architecture: 85,
            security: 90,
          },
        },
        false
      );

      expect(updated.minimumScores.codeQuality).toBe(85);
    });
  });

  describe('Profile Deletion', () => {
    it('should delete custom profile', () => {
      const customProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test',
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
      };

      profileManager.createProfile('delete-test', customProfile, false);
      expect(profileManager.getAllProfileNames()).toContain('delete-test');

      profileManager.deleteProfile('delete-test', false);
      expect(profileManager.getAllProfileNames()).not.toContain('delete-test');
    });

    it('should prevent deletion of built-in profiles', () => {
      expect(() => {
        profileManager.deleteProfile('strict', false);
      }).toThrow(ConfigurationError);
    });

    it('should throw error when deleting non-existent profile', () => {
      expect(() => {
        profileManager.deleteProfile('nonexistent', false);
      }).toThrow(ConfigurationError);
    });
  });

  describe('Built-in Profile Detection', () => {
    it('should identify built-in profiles', () => {
      expect(profileManager.isBuiltInProfile('strict')).toBe(true);
      expect(profileManager.isBuiltInProfile('moderate')).toBe(true);
      expect(profileManager.isBuiltInProfile('lenient')).toBe(true);
    });

    it('should identify custom profiles as non-built-in', () => {
      const customProfile: ProfileDefinition = {
        name: 'test',
        description: 'Test',
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
      };

      profileManager.createProfile('not-builtin', customProfile, false);
      expect(profileManager.isBuiltInProfile('not-builtin')).toBe(false);
    });
  });

  describe('Profile Export and Import', () => {
    it('should export profile as JSON string', () => {
      const exported = profileManager.exportProfile('moderate');
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.name).toBe('moderate');
      expect(parsed.weights).toBeDefined();
    });

    it('should import profile from JSON string', () => {
      const profileJson = JSON.stringify({
        name: 'imported',
        description: 'Imported profile',
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
      });

      profileManager.importProfile('imported-test', profileJson, false);
      const profile = profileManager.getProfile('imported-test');
      expect(profile.name).toBe('imported');
    });

    it('should reject invalid JSON on import', () => {
      expect(() => {
        profileManager.importProfile('invalid', 'not valid json', false);
      }).toThrow();
    });
  });

  describe('Profile Comparison', () => {
    it('should compare two profiles', () => {
      const comparison = profileManager.compareProfiles('strict', 'lenient');
      expect(comparison.profile1Name).toBe('strict');
      expect(comparison.profile2Name).toBe('lenient');
      expect(comparison.weights).toBeDefined();
      expect(comparison.minimumScores).toBeDefined();
      expect(comparison.weights.differences).toBeDefined();
      expect(comparison.minimumScores.differences).toBeDefined();
    });

    it('should calculate weight differences correctly', () => {
      const comparison = profileManager.compareProfiles('strict', 'moderate');
      const codeQualityDiff = Math.abs(0.35 - 0.3);
      expect(comparison.weights.differences.codeQuality).toBe(codeQualityDiff);
    });
  });

  describe('Environment Detection', () => {
    it('should detect current environment', () => {
      const env = profileManager.getCurrentEnvironment();
      expect(['dev', 'staging', 'production']).toContain(env);
    });

    it('should allow setting environment', () => {
      profileManager.setEnvironment('staging');
      expect(profileManager.getCurrentEnvironment()).toBe('staging');
      profileManager.setEnvironment('dev'); // Reset
    });
  });

  describe('Profile Not Found', () => {
    it('should throw error for non-existent profile', () => {
      expect(() => {
        profileManager.getProfile('nonexistent-profile-xyz');
      }).toThrow(ConfigurationError);
    });
  });

  describe('Profile Deep Copy', () => {
    it('should return independent copies of profiles', () => {
      const profile1 = profileManager.getProfile('moderate');
      const profile2 = profileManager.getProfile('moderate');

      profile1.minimumScores.codeQuality = 999;
      expect(profile2.minimumScores.codeQuality).toBe(80);
    });
  });

  describe('Profile Thresholds', () => {
    it('should include thresholds in strict profile', () => {
      const profile = profileManager.getProfile('strict');
      expect(profile.thresholds).toBeDefined();
      expect(profile.thresholds?.complexity?.max).toBe(10);
      expect(profile.thresholds?.coverage?.minimum).toBe(85);
      expect(profile.thresholds?.duplication?.maxPercent).toBe(2);
    });

    it('should include different thresholds in lenient profile', () => {
      const strict = profileManager.getProfile('strict');
      const lenient = profileManager.getProfile('lenient');

      expect(strict.thresholds?.complexity?.max).toBeLessThan(
        lenient.thresholds?.complexity?.max || 999
      );
    });
  });

  describe('Multiple Profiles', () => {
    it('should manage multiple custom profiles independently', () => {
      const profile1: ProfileDefinition = {
        name: 'test1',
        description: 'Test 1',
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
      };

      const profile2: ProfileDefinition = {
        name: 'test2',
        description: 'Test 2',
        weights: {
          codeQuality: 0.4,
          testCoverage: 0.3,
          architecture: 0.2,
          security: 0.1,
        },
        minimumScores: {
          codeQuality: 85,
          testCoverage: 75,
          architecture: 85,
          security: 90,
        },
      };

      profileManager.createProfile('multi-test-1', profile1, false);
      profileManager.createProfile('multi-test-2', profile2, false);

      const retrieved1 = profileManager.getProfile('multi-test-1');
      const retrieved2 = profileManager.getProfile('multi-test-2');

      expect(retrieved1.minimumScores.codeQuality).toBe(80);
      expect(retrieved2.minimumScores.codeQuality).toBe(85);
    });
  });
});
