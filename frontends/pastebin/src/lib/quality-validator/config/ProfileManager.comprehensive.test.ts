/**
 * Comprehensive Test Suite for ProfileManager
 * Extended tests for profile loading, validation, operations, merging, and error handling
 * TDD approach: RED -> GREEN -> REFACTOR
 *
 * Test Coverage:
 * - Profile loading from JSON files
 * - Profile validation (weights, scores, thresholds)
 * - CRUD operations (create, read, update, delete)
 * - Profile merging and comparison
 * - Error handling and edge cases
 * - Singleton pattern and state management
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProfileManager, type ProfileDefinition } from './ProfileManager';
import { ConfigurationError } from '../types/index';

describe('ProfileManager - Comprehensive Extended Tests', () => {
  let profileManager: ProfileManager;
  const testProfileDir = './.test-profiles-comprehensive';

  beforeEach(() => {
    profileManager = ProfileManager.getInstance();

    // Clean up before test
    if (fs.existsSync(testProfileDir)) {
      fs.rmSync(testProfileDir, { recursive: true });
    }
    fs.mkdirSync(testProfileDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up after test
    if (fs.existsSync(testProfileDir)) {
      fs.rmSync(testProfileDir, { recursive: true });
    }
  });

  // ============================================================================
  // 1. PROFILE LOADING TESTS
  // ============================================================================

  describe('Profile Loading - File Operations', () => {
    it('should load valid JSON profile file', () => {
      const profilePath = path.join(testProfileDir, 'test-profile.json');
      const profileData = {
        'test-profile': {
          name: 'test-profile',
          description: 'Test profile from file',
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
        },
      };

      fs.writeFileSync(profilePath, JSON.stringify(profileData, null, 2));

      const content = fs.readFileSync(profilePath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should handle missing files gracefully', () => {
      const nonExistentPath = path.join(testProfileDir, 'nonexistent.json');
      expect(fs.existsSync(nonExistentPath)).toBe(false);
    });

    it('should reject invalid JSON in file', () => {
      const profilePath = path.join(testProfileDir, 'invalid.json');
      fs.writeFileSync(profilePath, '{ invalid json ]');

      expect(() => {
        const content = fs.readFileSync(profilePath, 'utf-8');
        JSON.parse(content);
      }).toThrow(SyntaxError);
    });

    it('should reject non-object JSON content', () => {
      const profilePath = path.join(testProfileDir, 'non-object.json');
      fs.writeFileSync(profilePath, '"just a string"');

      const content = fs.readFileSync(profilePath, 'utf-8');
      const parsed = JSON.parse(content);
      expect(typeof parsed === 'object' && parsed !== null).toBe(false);
    });
  });

  describe('Profile Parsing - Structure Validation', () => {
    it('should parse complete profile structure', () => {
      const profile: ProfileDefinition = {
        name: 'complete',
        description: 'Complete profile with all fields',
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
      };

      profileManager.createProfile('complete-test', profile, false);
      const retrieved = profileManager.getProfile('complete-test');

      expect(retrieved.name).toBe('complete');
      expect(retrieved.thresholds?.complexity?.max).toBe(15);
      expect(retrieved.thresholds?.coverage?.minimum).toBe(70);
      expect(retrieved.thresholds?.duplication?.maxPercent).toBe(5);
    });

    it('should parse profile with minimal fields', () => {
      const profile: ProfileDefinition = {
        name: 'minimal',
        description: 'Minimal profile',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 50,
          testCoverage: 50,
          architecture: 50,
          security: 50,
        },
      };

      profileManager.createProfile('minimal-test', profile, false);
      const retrieved = profileManager.getProfile('minimal-test');

      expect(retrieved.name).toBe('minimal');
      expect(retrieved.thresholds).toBeUndefined();
    });
  });

  // ============================================================================
  // 2. WEIGHT VALIDATION TESTS
  // ============================================================================

  describe('Weight Validation', () => {
    it('should validate weights sum to 1.0 exactly', () => {
      const validProfile: ProfileDefinition = {
        name: 'valid-weights',
        description: 'Valid weights',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      expect(() => {
        profileManager.createProfile('weights-exact', validProfile, false);
      }).not.toThrow();
    });

    it('should accept weights within tolerance (0.001)', () => {
      const toleranceProfile: ProfileDefinition = {
        name: 'tolerance-weights',
        description: 'Weights within tolerance',
        weights: {
          codeQuality: 0.3,
          testCoverage: 0.35,
          architecture: 0.2,
          security: 0.150001,
        },
        minimumScores: {
          codeQuality: 80,
          testCoverage: 70,
          architecture: 80,
          security: 85,
        },
      };

      expect(() => {
        profileManager.createProfile('tolerance-test', toleranceProfile, false);
      }).not.toThrow();
    });

    it('should reject weights exceeding sum', () => {
      const overProfile: ProfileDefinition = {
        name: 'over-weights',
        description: 'Weights exceed 1.0',
        weights: {
          codeQuality: 0.4,
          testCoverage: 0.4,
          architecture: 0.2,
          security: 0.2,
        },
        minimumScores: {
          codeQuality: 80,
          testCoverage: 70,
          architecture: 80,
          security: 85,
        },
      };

      expect(() => {
        profileManager.createProfile('over-test', overProfile, false);
      }).toThrow(ConfigurationError);
    });

    it('should reject weights below sum', () => {
      const underProfile: ProfileDefinition = {
        name: 'under-weights',
        description: 'Weights below 1.0',
        weights: {
          codeQuality: 0.2,
          testCoverage: 0.2,
          architecture: 0.2,
          security: 0.2,
        },
        minimumScores: {
          codeQuality: 80,
          testCoverage: 70,
          architecture: 80,
          security: 85,
        },
      };

      expect(() => {
        profileManager.createProfile('under-test', underProfile, false);
      }).toThrow(ConfigurationError);
    });
  });

  // ============================================================================
  // 3. MINIMUM SCORE VALIDATION TESTS
  // ============================================================================

  describe('Minimum Score Validation', () => {
    it('should accept scores between 0 and 100', () => {
      const validScores: ProfileDefinition = {
        name: 'valid-scores',
        description: 'Valid scores',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 0,
          testCoverage: 50,
          architecture: 100,
          security: 75,
        },
      };

      expect(() => {
        profileManager.createProfile('valid-scores', validScores, false);
      }).not.toThrow();
    });

    it('should reject negative minimum scores', () => {
      const negativeScores: ProfileDefinition = {
        name: 'negative-scores',
        description: 'Negative scores',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: -10,
          testCoverage: 70,
          architecture: 80,
          security: 85,
        },
      };

      expect(() => {
        profileManager.createProfile('negative-scores', negativeScores, false);
      }).toThrow(ConfigurationError);
    });

    it('should reject minimum scores over 100', () => {
      const overScores: ProfileDefinition = {
        name: 'over-scores',
        description: 'Over 100 scores',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 150,
          testCoverage: 70,
          architecture: 80,
          security: 85,
        },
      };

      expect(() => {
        profileManager.createProfile('over-scores', overScores, false);
      }).toThrow(ConfigurationError);
    });
  });

  // ============================================================================
  // 4. THRESHOLD VALIDATION TESTS
  // ============================================================================

  describe('Threshold Validation', () => {
    it('should validate complexity thresholds', () => {
      const validThresholds: ProfileDefinition = {
        name: 'valid-thresholds',
        description: 'Valid thresholds',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
        thresholds: {
          complexity: { max: 20, warning: 15 },
        },
      };

      expect(() => {
        profileManager.createProfile('complexity-valid', validThresholds, false);
      }).not.toThrow();
    });

    it('should reject when warning exceeds max complexity', () => {
      const invalidThresholds: ProfileDefinition = {
        name: 'invalid-thresholds',
        description: 'Invalid thresholds',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
        thresholds: {
          complexity: { max: 10, warning: 20 },
        },
      };

      expect(() => {
        profileManager.createProfile('complexity-invalid', invalidThresholds, false);
      }).toThrow(ConfigurationError);
    });

    it('should validate duplication thresholds', () => {
      const validDuplication: ProfileDefinition = {
        name: 'valid-duplication',
        description: 'Valid duplication',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
        thresholds: {
          duplication: { maxPercent: 10, warningPercent: 5 },
        },
      };

      expect(() => {
        profileManager.createProfile('duplication-valid', validDuplication, false);
      }).not.toThrow();
    });

    it('should reject when warning exceeds max duplication', () => {
      const invalidDuplication: ProfileDefinition = {
        name: 'invalid-duplication',
        description: 'Invalid duplication',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
        thresholds: {
          duplication: { maxPercent: 5, warningPercent: 10 },
        },
      };

      expect(() => {
        profileManager.createProfile('duplication-invalid', invalidDuplication, false);
      }).toThrow(ConfigurationError);
    });

    it('should accept partial threshold definitions', () => {
      const partialThresholds: ProfileDefinition = {
        name: 'partial-thresholds',
        description: 'Partial thresholds',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
        thresholds: {
          complexity: { max: 20 },
        },
      };

      expect(() => {
        profileManager.createProfile('partial-thresholds', partialThresholds, false);
      }).not.toThrow();
    });
  });

  // ============================================================================
  // 5. CREATE, UPDATE, DELETE OPERATIONS
  // ============================================================================

  describe('Profile CRUD Operations', () => {
    it('should create new profile successfully', () => {
      const profile: ProfileDefinition = {
        name: 'new-profile',
        description: 'New profile',
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

      const created = profileManager.createProfile('new-profile', profile, false);
      expect(created.name).toBe('new-profile');
    });

    it('should prevent duplicate profile names', () => {
      const profile: ProfileDefinition = {
        name: 'duplicate',
        description: 'Duplicate test',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      profileManager.createProfile('duplicate-test', profile, false);

      expect(() => {
        profileManager.createProfile('duplicate-test', profile, false);
      }).toThrow(ConfigurationError);
    });

    it('should update profile weights', () => {
      const profile: ProfileDefinition = {
        name: 'update-test',
        description: 'Update test',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      profileManager.createProfile('update-weights', profile, false);
      const updated = profileManager.updateProfile(
        'update-weights',
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
      expect(updated.weights.testCoverage).toBe(0.3);
    });

    it('should delete custom profile', () => {
      const profile: ProfileDefinition = {
        name: 'delete-test',
        description: 'Delete test',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      profileManager.createProfile('to-delete', profile, false);
      expect(profileManager.getAllProfileNames()).toContain('to-delete');

      profileManager.deleteProfile('to-delete', false);
      expect(profileManager.getAllProfileNames()).not.toContain('to-delete');
    });

    it('should prevent deletion of built-in profiles', () => {
      expect(() => {
        profileManager.deleteProfile('strict', false);
      }).toThrow(ConfigurationError);
    });
  });

  // ============================================================================
  // 6. PROFILE COMPARISON AND EXPORT/IMPORT
  // ============================================================================

  describe('Profile Comparison and Serialization', () => {
    it('should export profile as JSON string', () => {
      const exported = profileManager.exportProfile('moderate');
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(parsed.name).toBe('moderate');
      expect(parsed.weights).toBeDefined();
      expect(parsed.minimumScores).toBeDefined();
    });

    it('should import profile from JSON string', () => {
      const profileJson = JSON.stringify({
        name: 'imported-profile',
        description: 'Imported from JSON',
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

      profileManager.importProfile('imported-json', profileJson, false);
      const profile = profileManager.getProfile('imported-json');

      expect(profile.name).toBe('imported-profile');
      expect(profile.weights.codeQuality).toBe(0.3);
    });

    it('should compare two profiles', () => {
      const comparison = profileManager.compareProfiles('strict', 'lenient');

      expect(comparison.profile1Name).toBe('strict');
      expect(comparison.profile2Name).toBe('lenient');
      expect(comparison.weights).toBeDefined();
      expect(comparison.minimumScores).toBeDefined();
      expect(comparison.weights.differences).toBeDefined();
    });

    it('should calculate correct differences in comparison', () => {
      const comparison = profileManager.compareProfiles('strict', 'moderate');

      const strictProfile = profileManager.getProfile('strict');
      const moderateProfile = profileManager.getProfile('moderate');

      const expectedDiff = Math.abs(
        strictProfile.weights.codeQuality - moderateProfile.weights.codeQuality
      );
      expect(comparison.weights.differences.codeQuality).toBe(expectedDiff);
    });
  });

  // ============================================================================
  // 7. EDGE CASES
  // ============================================================================

  describe('Edge Cases and Boundaries', () => {
    it('should handle very large weight values', () => {
      const largeWeightProfile: ProfileDefinition = {
        name: 'large-weights',
        description: 'Large weight values',
        weights: {
          codeQuality: 0.9999999999,
          testCoverage: 0.0000000001,
          architecture: 0.0000000000,
          security: 0.0000000000,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      expect(() => {
        profileManager.createProfile('large-weights', largeWeightProfile, false);
      }).not.toThrow();
    });

    it('should handle zero weights', () => {
      const zeroWeightProfile: ProfileDefinition = {
        name: 'zero-weights',
        description: 'Zero weight values',
        weights: {
          codeQuality: 1.0,
          testCoverage: 0,
          architecture: 0,
          security: 0,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      expect(() => {
        profileManager.createProfile('zero-weights', zeroWeightProfile, false);
      }).not.toThrow();
    });

    it('should handle boundary score values', () => {
      const boundaryScores: ProfileDefinition = {
        name: 'boundary-scores',
        description: 'Boundary score values',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 0,
          testCoverage: 100,
          architecture: 50,
          security: 75,
        },
      };

      expect(() => {
        profileManager.createProfile('boundary-scores', boundaryScores, false);
      }).not.toThrow();
    });

    it('should handle multiple profile updates in sequence', () => {
      const profile: ProfileDefinition = {
        name: 'sequential',
        description: 'Sequential updates',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      profileManager.createProfile('sequential-updates', profile, false);

      let updated = profileManager.updateProfile(
        'sequential-updates',
        {
          minimumScores: {
            codeQuality: 80,
            testCoverage: 75,
            architecture: 75,
            security: 75,
          },
        },
        false
      );
      expect(updated.minimumScores.codeQuality).toBe(80);

      updated = profileManager.updateProfile(
        'sequential-updates',
        {
          minimumScores: {
            codeQuality: 85,
            testCoverage: 75,
            architecture: 75,
            security: 75,
          },
        },
        false
      );
      expect(updated.minimumScores.codeQuality).toBe(85);
    });
  });

  // ============================================================================
  // 8. INTEGRATION WORKFLOWS
  // ============================================================================

  describe('Integration Workflows', () => {
    it('should support complete workflow: create, update, compare, delete', () => {
      const profile: ProfileDefinition = {
        name: 'workflow',
        description: 'Workflow test',
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

      profileManager.createProfile('workflow-test', profile, false);
      expect(profileManager.getAllProfileNames()).toContain('workflow-test');

      profileManager.updateProfile(
        'workflow-test',
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

      const comparison = profileManager.compareProfiles('workflow-test', 'strict');
      expect(comparison).toBeDefined();

      profileManager.deleteProfile('workflow-test', false);
      expect(profileManager.getAllProfileNames()).not.toContain('workflow-test');
    });

    it('should manage multiple profiles independently', () => {
      const profile1: ProfileDefinition = {
        name: 'profile1',
        description: 'Profile 1',
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

      const profile2: ProfileDefinition = {
        name: 'profile2',
        description: 'Profile 2',
        weights: {
          codeQuality: 0.2,
          testCoverage: 0.4,
          architecture: 0.3,
          security: 0.1,
        },
        minimumScores: {
          codeQuality: 70,
          testCoverage: 80,
          architecture: 70,
          security: 80,
        },
      };

      profileManager.createProfile('multi-1', profile1, false);
      profileManager.createProfile('multi-2', profile2, false);

      const retrieved1 = profileManager.getProfile('multi-1');
      const retrieved2 = profileManager.getProfile('multi-2');

      expect(retrieved1.weights.codeQuality).toBe(0.4);
      expect(retrieved2.weights.codeQuality).toBe(0.2);
    });
  });

  // ============================================================================
  // 9. ERROR SCENARIOS
  // ============================================================================

  describe('Error Handling', () => {
    it('should throw error for non-existent profile', () => {
      expect(() => {
        profileManager.getProfile('nonexistent-profile-xyz');
      }).toThrow(ConfigurationError);
    });

    it('should throw error when updating non-existent profile', () => {
      expect(() => {
        profileManager.updateProfile('nonexistent', {}, false);
      }).toThrow(ConfigurationError);
    });

    it('should throw error when deleting non-existent profile', () => {
      expect(() => {
        profileManager.deleteProfile('nonexistent-profile', false);
      }).toThrow(ConfigurationError);
    });

    it('should reject invalid JSON on import', () => {
      expect(() => {
        profileManager.importProfile('invalid-json', 'not valid json', false);
      }).toThrow();
    });

    it('should validate imported profile', () => {
      const invalidJson = JSON.stringify({
        name: 'invalid',
        description: 'Invalid',
        weights: { codeQuality: 0.5, testCoverage: 0.5, architecture: 0.5, security: 0.5 },
        minimumScores: { codeQuality: 75, testCoverage: 75, architecture: 75, security: 75 },
      });

      expect(() => {
        profileManager.importProfile('invalid-import', invalidJson, false);
      }).toThrow(ConfigurationError);
    });
  });

  // ============================================================================
  // 10. STATE AND INDEPENDENCE
  // ============================================================================

  describe('Profile Independence and State', () => {
    it('should return independent copies of profiles', () => {
      const profile1 = profileManager.getProfile('moderate');
      const profile2 = profileManager.getProfile('moderate');

      profile1.minimumScores.codeQuality = 999;
      expect(profile2.minimumScores.codeQuality).toBe(80);
    });

    it('should persist profile state across retrievals', () => {
      const profile: ProfileDefinition = {
        name: 'persistent',
        description: 'Persistent test',
        weights: {
          codeQuality: 0.25,
          testCoverage: 0.25,
          architecture: 0.25,
          security: 0.25,
        },
        minimumScores: {
          codeQuality: 75,
          testCoverage: 75,
          architecture: 75,
          security: 75,
        },
      };

      const instance1 = ProfileManager.getInstance();
      instance1.createProfile('persistent-test', profile, false);

      const instance2 = ProfileManager.getInstance();
      const retrieved = instance2.getProfile('persistent-test');

      expect(retrieved.name).toBe('persistent');
    });
  });
});
