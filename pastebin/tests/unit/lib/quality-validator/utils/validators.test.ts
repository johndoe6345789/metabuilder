/**
 * Comprehensive Unit Tests for Validators Utility
 *
 * Tests all validation functions for input checking, data integrity,
 * and configuration validation.
 *
 * Requirements Covered:
 * 1. Score Validation - Range checks, type validation
 * 2. File Location Validation - Path and position validation
 * 3. Finding Validation - Complete structure checks
 * 4. Recommendation Validation - Priority and details checks
 * 5. Metrics Validation - Object structure checks
 * 6. Scoring Result Validation - Complete result validation
 * 7. Configuration Validation - Threshold and weight validation
 * 8. Finding Sanitization - Default value application
 * 9. Recommendation Sanitization - Default value application
 * 10. Exclude Path Checking - Pattern matching
 * 11. Score Range Validation - Min/max bounds
 * 12. Complexity Validation - Threshold comparisons
 * 13. Coverage Validation - Percentage checks
 * 14. Security Severity Validation - Valid severity levels
 * 15. Grade Validation - Valid letters
 * 16. Status Validation - Valid status values
 * 17. Priority Validation - Valid priorities
 * 18. Effort Validation - Valid effort levels
 * 19. Percentage Validation - 0-100 range
 * 20. Duplication Validation - Percentage checks
 * 21. Weight Validation - 0-1 range
 * 22. Weight Sum Validation - Sum to 1.0
 * 23. Version Validation - Semantic versioning
 * 24. URL Validation - Valid URL format
 */

import {
  validateScore,
  validateFileLocation,
  validateFinding,
  validateRecommendation,
  validateMetrics,
  validateScoringResult,
  validateConfiguration,
  sanitizeFinding,
  sanitizeRecommendation,
  shouldExcludeFile,
  validateScoreRange,
  validateComplexity,
  validateCoveragePercentage,
  validateSecuritySeverity,
  validateGrade,
  validateStatus,
  validatePriority,
  validateEffort,
  validatePercentage,
  validateDuplication,
  validateWeight,
  validateWeightSum,
  validateVersion,
  validateUrl,
} from '../../../../../src/lib/quality-validator/utils/validators';
import { createMockFinding, createDefaultConfig } from '../../../../../tests/test-utils';
import {
  Finding,
  Recommendation,
  ScoringResult,
  Configuration,
  FileLocation,
  CodeQualityMetrics,
} from '../../../../../src/lib/quality-validator/types/index';

// ============================================================================
// SCORE VALIDATION
// ============================================================================

describe('Validators - Score Validation', () => {
  it('should validate score in range', () => {
    expect(validateScore(0)).toBe(true);
    expect(validateScore(50)).toBe(true);
    expect(validateScore(100)).toBe(true);
  });

  it('should reject score below 0', () => {
    expect(validateScore(-1)).toBe(false);
  });

  it('should reject score above 100', () => {
    expect(validateScore(101)).toBe(false);
  });

  it('should reject non-number values', () => {
    expect(validateScore(NaN)).toBe(false);
  });

  it('should validate decimal scores', () => {
    expect(validateScore(85.5)).toBe(true);
    expect(validateScore(0.1)).toBe(true);
  });
});

// ============================================================================
// FILE LOCATION VALIDATION
// ============================================================================

describe('Validators - File Location Validation', () => {
  it('should validate complete file location', () => {
    const location: FileLocation = { file: 'src/app.ts', line: 45, column: 10 };
    expect(validateFileLocation(location)).toBe(true);
  });

  it('should accept undefined location', () => {
    expect(validateFileLocation(undefined)).toBe(true);
  });

  it('should reject location with empty file', () => {
    const location: FileLocation = { file: '', line: 45 };
    expect(validateFileLocation(location)).toBe(false);
  });

  it('should reject location with non-string file', () => {
    const location = { file: 123, line: 45 } as any;
    expect(validateFileLocation(location)).toBe(false);
  });

  it('should reject negative line number', () => {
    const location: FileLocation = { file: 'src/app.ts', line: -1 };
    expect(validateFileLocation(location)).toBe(false);
  });

  it('should reject negative column number', () => {
    const location: FileLocation = { file: 'src/app.ts', column: -1 };
    expect(validateFileLocation(location)).toBe(false);
  });

  it('should accept location with only file', () => {
    const location: FileLocation = { file: 'src/app.ts' };
    expect(validateFileLocation(location)).toBe(true);
  });

  it('should accept zero line numbers', () => {
    const location: FileLocation = { file: 'src/app.ts', line: 0, column: 0 };
    expect(validateFileLocation(location)).toBe(true);
  });
});

// ============================================================================
// FINDING VALIDATION
// ============================================================================

describe('Validators - Finding Validation', () => {
  it('should validate complete finding', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'SQL Injection',
      description: 'Input not sanitized',
      remediation: 'Add validation',
    };
    expect(validateFinding(finding)).toHaveLength(0);
  });

  it('should require valid id', () => {
    const finding: Finding = {
      id: '',
      severity: 'high',
      category: 'security',
      title: 'Issue',
      description: 'Description',
      remediation: 'Fix it',
    };
    const errors = validateFinding(finding);
    expect(errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('should require valid severity', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'unknown' as any,
      category: 'security',
      title: 'Issue',
      description: 'Description',
      remediation: 'Fix it',
    };
    const errors = validateFinding(finding);
    expect(errors.some((e) => e.includes('severity'))).toBe(true);
  });

  it('should require valid title', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: '',
      description: 'Description',
      remediation: 'Fix it',
    };
    const errors = validateFinding(finding);
    expect(errors.some((e) => e.includes('title'))).toBe(true);
  });

  it('should require valid description', () => {
    const finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'Issue',
      description: '',
      remediation: 'Fix it',
    };
    const errors = validateFinding(finding as Finding);
    expect(errors.some((e) => e.includes('description'))).toBe(true);
  });

  it('should require valid remediation', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'Issue',
      description: 'Description',
      remediation: '',
    };
    const errors = validateFinding(finding);
    expect(errors.some((e) => e.includes('remediation'))).toBe(true);
  });

  it('should validate location if provided', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'Issue',
      description: 'Description',
      remediation: 'Fix it',
      location: { file: '', line: 0 },
    };
    const errors = validateFinding(finding);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept optional fields', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'Issue',
      description: 'Description',
      remediation: 'Fix it',
      evidence: 'Code snippet',
      moreInfo: 'https://example.com',
      affectedItems: 5,
    };
    expect(validateFinding(finding)).toHaveLength(0);
  });

  it('should validate all severity levels', () => {
    const severities: Array<'critical' | 'high' | 'medium' | 'low' | 'info'> = ['critical', 'high', 'medium', 'low', 'info'];
    for (const severity of severities) {
      const finding: Finding = {
        id: 'FIND-001',
        severity,
        category: 'security',
        title: 'Issue',
        description: 'Description',
        remediation: 'Fix it',
      };
      expect(validateFinding(finding)).toHaveLength(0);
    }
  });
});

// ============================================================================
// RECOMMENDATION VALIDATION
// ============================================================================

describe('Validators - Recommendation Validation', () => {
  it('should validate complete recommendation', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: 'Low coverage',
      remediation: 'Add tests',
      estimatedEffort: 'high',
      expectedImpact: '10% improvement',
    };
    expect(validateRecommendation(rec)).toHaveLength(0);
  });

  it('should require valid priority', () => {
    const rec: Recommendation = {
      priority: 'urgent' as any,
      category: 'testing',
      issue: 'Low coverage',
      remediation: 'Add tests',
      estimatedEffort: 'high',
      expectedImpact: '10% improvement',
    };
    const errors = validateRecommendation(rec);
    expect(errors.some((e) => e.includes('priority'))).toBe(true);
  });

  it('should require valid issue', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: '',
      remediation: 'Add tests',
      estimatedEffort: 'high',
      expectedImpact: '10% improvement',
    };
    const errors = validateRecommendation(rec);
    expect(errors.some((e) => e.includes('issue'))).toBe(true);
  });

  it('should require valid remediation', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: 'Low coverage',
      remediation: '',
      estimatedEffort: 'high',
      expectedImpact: '10% improvement',
    };
    const errors = validateRecommendation(rec);
    expect(errors.some((e) => e.includes('remediation'))).toBe(true);
  });

  it('should require valid estimatedEffort', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: 'Low coverage',
      remediation: 'Add tests',
      estimatedEffort: 'maximum' as any,
      expectedImpact: '10% improvement',
    };
    const errors = validateRecommendation(rec);
    expect(errors.some((e) => e.includes('estimatedEffort'))).toBe(true);
  });

  it('should require valid expectedImpact', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: 'Low coverage',
      remediation: 'Add tests',
      estimatedEffort: 'high',
      expectedImpact: '',
    };
    const errors = validateRecommendation(rec);
    expect(errors.some((e) => e.includes('expectedImpact'))).toBe(true);
  });

  it('should validate all priority levels', () => {
    const priorities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    for (const priority of priorities) {
      const rec: Recommendation = {
        priority,
        category: 'testing',
        issue: 'Low coverage',
        remediation: 'Add tests',
        estimatedEffort: 'high',
        expectedImpact: '10% improvement',
      };
      expect(validateRecommendation(rec)).toHaveLength(0);
    }
  });
});

// ============================================================================
// METRICS VALIDATION
// ============================================================================

describe('Validators - Metrics Validation', () => {
  it('should validate valid metrics object', () => {
    const metrics = {
      complexity: { functions: [] },
      duplication: { percent: 2 },
      linting: { errors: 0 },
    };
    expect(validateMetrics(metrics)).toBe(true);
  });

  it('should reject null metrics', () => {
    expect(validateMetrics(null)).toBe(false);
  });

  it('should reject non-object metrics', () => {
    expect(validateMetrics('metrics')).toBe(false);
    expect(validateMetrics(123)).toBe(false);
  });

  it('should reject invalid complexity metric', () => {
    const metrics = {
      complexity: 'not an object',
      duplication: { percent: 2 },
      linting: { errors: 0 },
    };
    expect(validateMetrics(metrics)).toBe(false);
  });

  it('should accept empty metrics object', () => {
    expect(validateMetrics({})).toBe(true);
  });
});

// ============================================================================
// SCORING RESULT VALIDATION
// ============================================================================

describe('Validators - Scoring Result Validation', () => {
  it('should validate complete result', () => {
    const result: ScoringResult = {
      overall: {
        score: 85,
        grade: 'B',
        status: 'pass',
        summary: 'Good',
        passesThresholds: true,
      },
      componentScores: {
        codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
        testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
        architecture: { score: 75, weight: 0.2, weightedScore: 15 },
        security: { score: 85, weight: 0.15, weightedScore: 12.75 },
      },
      findings: [],
      recommendations: [],
      metadata: {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: '/project',
        nodeVersion: process.version,
        configUsed: createDefaultConfig(),
      },
    };
    expect(validateScoringResult(result)).toHaveLength(0);
  });

  it('should require overall score', () => {
    const result = {
      componentScores: {},
      findings: [],
      recommendations: [],
      metadata: {},
    } as any;
    const errors = validateScoringResult(result);
    expect(errors.some((e) => e.includes('overall'))).toBe(true);
  });

  it('should validate overall score range', () => {
    const result: ScoringResult = {
      overall: {
        score: 150,
        grade: 'A',
        status: 'pass',
        summary: 'Good',
        passesThresholds: true,
      },
      componentScores: {
        codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
        testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
        architecture: { score: 75, weight: 0.2, weightedScore: 15 },
        security: { score: 85, weight: 0.15, weightedScore: 12.75 },
      },
      findings: [],
      recommendations: [],
      metadata: {} as any,
    };
    const errors = validateScoringResult(result);
    expect(errors.some((e) => e.includes('score'))).toBe(true);
  });

  it('should validate grade', () => {
    const result: ScoringResult = {
      overall: {
        score: 85,
        grade: 'Z' as any,
        status: 'pass',
        summary: 'Good',
        passesThresholds: true,
      },
      componentScores: {
        codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
        testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
        architecture: { score: 75, weight: 0.2, weightedScore: 15 },
        security: { score: 85, weight: 0.15, weightedScore: 12.75 },
      },
      findings: [],
      recommendations: [],
      metadata: {} as any,
    };
    const errors = validateScoringResult(result);
    expect(errors.some((e) => e.includes('Grade'))).toBe(true);
  });

  it('should require findings array', () => {
    const result: ScoringResult = {
      overall: {
        score: 85,
        grade: 'B',
        status: 'pass',
        summary: 'Good',
        passesThresholds: true,
      },
      componentScores: {
        codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
        testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
        architecture: { score: 75, weight: 0.2, weightedScore: 15 },
        security: { score: 85, weight: 0.15, weightedScore: 12.75 },
      },
      findings: 'not an array' as any,
      recommendations: [],
      metadata: {} as any,
    };
    const errors = validateScoringResult(result);
    expect(errors.some((e) => e.includes('Findings'))).toBe(true);
  });
});

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

describe('Validators - Configuration Validation', () => {
  it('should validate configuration with correct thresholds', () => {
    const config = createDefaultConfig();
    // Fix the coverage thresholds to be valid
    config.testCoverage.warningPercent = 85;
    config.testCoverage.minimumPercent = 80;
    const errors = validateConfiguration(config);
    expect(errors).toHaveLength(0);
  });

  it('should require configuration object', () => {
    const errors = validateConfiguration(null as any);
    expect(errors.some((e) => e.includes('required'))).toBe(true);
  });

  it('should validate scoring weights sum to 1.0', () => {
    const config = createDefaultConfig();
    config.scoring.weights = {
      codeQuality: 0.3,
      testCoverage: 0.35,
      architecture: 0.2,
      security: 0.1,
    };
    const errors = validateConfiguration(config);
    expect(errors.some((e) => e.includes('weights'))).toBe(true);
  });

  it('should validate individual weight ranges', () => {
    const config = createDefaultConfig();
    config.scoring.weights.codeQuality = 1.5;
    const errors = validateConfiguration(config);
    expect(errors.some((e) => e.includes('codeQuality'))).toBe(true);
  });

  it('should validate complexity thresholds', () => {
    const config = createDefaultConfig();
    config.codeQuality.complexity.warning = 25;
    config.codeQuality.complexity.max = 20;
    const errors = validateConfiguration(config);
    expect(errors.some((e) => e.includes('warning'))).toBe(true);
  });

  it('should validate coverage thresholds', () => {
    const config = createDefaultConfig();
    config.testCoverage.warningPercent = 70; // warning below minimum
    config.testCoverage.minimumPercent = 80;
    const errors = validateConfiguration(config);
    expect(errors.some((e) => e.includes('warning'))).toBe(true);
  });
});

// ============================================================================
// FINDING SANITIZATION
// ============================================================================

describe('Validators - Finding Sanitization', () => {
  it('should sanitize finding with trimmed strings', () => {
    const finding: Finding = {
      id: ' FIND-001 ',
      severity: 'high',
      category: 'security',
      title: ' Issue ',
      description: ' Description ',
      remediation: ' Fix it ',
    };
    const sanitized = sanitizeFinding(finding);
    expect(sanitized.title).toBe('Issue');
    expect(sanitized.description).toBe('Description');
  });

  it('should provide default title for empty', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: '',
      description: 'Description',
      remediation: 'Fix it',
    };
    const sanitized = sanitizeFinding(finding);
    expect(sanitized.title).toBe('Unknown Issue');
  });

  it('should validate and remove invalid location', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'Issue',
      description: 'Description',
      remediation: 'Fix it',
      location: { file: '', line: 0 },
    };
    const sanitized = sanitizeFinding(finding);
    expect(sanitized.location).toBeUndefined();
  });

  it('should fix invalid severity', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'invalid' as any,
      category: 'security',
      title: 'Issue',
      description: 'Description',
      remediation: 'Fix it',
    };
    const sanitized = sanitizeFinding(finding);
    expect(sanitized.severity).toBe('medium');
  });
});

// ============================================================================
// RECOMMENDATION SANITIZATION
// ============================================================================

describe('Validators - Recommendation Sanitization', () => {
  it('should sanitize recommendation with defaults', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: '  Low coverage  ',
      remediation: '  Add tests  ',
      estimatedEffort: 'high',
      expectedImpact: '  10% improvement  ',
    };
    const sanitized = sanitizeRecommendation(rec);
    expect(sanitized.issue).toBe('Low coverage');
    expect(sanitized.remediation).toBe('Add tests');
  });

  it('should fix invalid priority', () => {
    const rec: Recommendation = {
      priority: 'urgent' as any,
      category: 'testing',
      issue: 'Issue',
      remediation: 'Fix it',
      estimatedEffort: 'high',
      expectedImpact: 'Impact',
    };
    const sanitized = sanitizeRecommendation(rec);
    expect(sanitized.priority).toBe('medium');
  });

  it('should provide default empty remediation', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: 'Issue',
      remediation: '',
      estimatedEffort: 'high',
      expectedImpact: 'Impact',
    };
    const sanitized = sanitizeRecommendation(rec);
    expect(sanitized.remediation).toBe('');
  });
});

// ============================================================================
// EXCLUDE PATH VALIDATION
// ============================================================================

describe('Validators - Exclude Path Validation', () => {
  it('should identify excluded file', () => {
    expect(shouldExcludeFile('node_modules/pkg/index.js', ['node_modules'])).toBe(true);
  });

  it('should identify non-excluded file', () => {
    expect(shouldExcludeFile('src/app.ts', ['node_modules', '.git'])).toBe(false);
  });

  it('should handle multiple patterns', () => {
    const patterns = ['node_modules', '.git', 'dist', '.nyc_output'];
    expect(shouldExcludeFile('dist/index.js', patterns)).toBe(true);
    expect(shouldExcludeFile('.git/config', patterns)).toBe(true);
  });

  it('should handle empty pattern list', () => {
    expect(shouldExcludeFile('any/file.ts', [])).toBe(false);
  });

  it('should match partial paths', () => {
    expect(shouldExcludeFile('src/.git/something', ['.git'])).toBe(true);
  });
});

// ============================================================================
// SCORE RANGE VALIDATION
// ============================================================================

describe('Validators - Score Range Validation', () => {
  it('should validate score in default range', () => {
    expect(validateScoreRange(50)).toBe(true);
    expect(validateScoreRange(0)).toBe(true);
    expect(validateScoreRange(100)).toBe(true);
  });

  it('should validate custom range', () => {
    expect(validateScoreRange(25, 0, 50)).toBe(true);
    expect(validateScoreRange(60, 0, 50)).toBe(false);
  });
});

// ============================================================================
// COMPLEXITY VALIDATION
// ============================================================================

describe('Validators - Complexity Validation', () => {
  it('should validate acceptable complexity', () => {
    expect(validateComplexity(10, 20, 15)).toBe(true);
  });

  it('should reject complexity above max', () => {
    expect(validateComplexity(25, 20, 15)).toBe(false);
  });

  it('should reject invalid thresholds', () => {
    expect(validateComplexity(10, 15, 20)).toBe(false);
  });
});

// ============================================================================
// COVERAGE PERCENTAGE VALIDATION
// ============================================================================

describe('Validators - Coverage Percentage Validation', () => {
  it('should validate adequate coverage', () => {
    expect(validateCoveragePercentage(85, 80)).toBe(true);
  });

  it('should reject inadequate coverage', () => {
    expect(validateCoveragePercentage(75, 80)).toBe(false);
  });

  it('should reject coverage above 100', () => {
    expect(validateCoveragePercentage(105, 80)).toBe(false);
  });
});

// ============================================================================
// SECURITY SEVERITY VALIDATION
// ============================================================================

describe('Validators - Security Severity Validation', () => {
  it('should validate all severity levels', () => {
    expect(validateSecuritySeverity('critical')).toBe(true);
    expect(validateSecuritySeverity('high')).toBe(true);
    expect(validateSecuritySeverity('medium')).toBe(true);
    expect(validateSecuritySeverity('low')).toBe(true);
    expect(validateSecuritySeverity('info')).toBe(true);
  });

  it('should reject invalid severity', () => {
    expect(validateSecuritySeverity('unknown')).toBe(false);
  });

  it('should handle case insensitivity', () => {
    expect(validateSecuritySeverity('HIGH')).toBe(true);
  });
});

// ============================================================================
// GRADE VALIDATION
// ============================================================================

describe('Validators - Grade Validation', () => {
  it('should validate all letter grades', () => {
    expect(validateGrade('A')).toBe(true);
    expect(validateGrade('B')).toBe(true);
    expect(validateGrade('C')).toBe(true);
    expect(validateGrade('D')).toBe(true);
    expect(validateGrade('F')).toBe(true);
  });

  it('should reject invalid grades', () => {
    expect(validateGrade('G')).toBe(false);
    expect(validateGrade('E')).toBe(false);
  });
});

// ============================================================================
// STATUS VALIDATION
// ============================================================================

describe('Validators - Status Validation', () => {
  it('should validate valid statuses', () => {
    expect(validateStatus('pass')).toBe(true);
    expect(validateStatus('fail')).toBe(true);
    expect(validateStatus('warning')).toBe(true);
  });

  it('should handle case insensitivity', () => {
    expect(validateStatus('PASS')).toBe(true);
  });

  it('should reject invalid status', () => {
    expect(validateStatus('unknown')).toBe(false);
  });
});

// ============================================================================
// PRIORITY VALIDATION
// ============================================================================

describe('Validators - Priority Validation', () => {
  it('should validate valid priorities', () => {
    expect(validatePriority('critical')).toBe(true);
    expect(validatePriority('high')).toBe(true);
    expect(validatePriority('medium')).toBe(true);
    expect(validatePriority('low')).toBe(true);
  });

  it('should handle case insensitivity', () => {
    expect(validatePriority('HIGH')).toBe(true);
  });

  it('should reject invalid priority', () => {
    expect(validatePriority('urgent')).toBe(false);
  });
});

// ============================================================================
// EFFORT VALIDATION
// ============================================================================

describe('Validators - Effort Validation', () => {
  it('should validate valid effort levels', () => {
    expect(validateEffort('high')).toBe(true);
    expect(validateEffort('medium')).toBe(true);
    expect(validateEffort('low')).toBe(true);
  });

  it('should reject invalid effort', () => {
    expect(validateEffort('maximum')).toBe(false);
  });
});

// ============================================================================
// PERCENTAGE VALIDATION
// ============================================================================

describe('Validators - Percentage Validation', () => {
  it('should validate percentage values', () => {
    expect(validatePercentage(0)).toBe(true);
    expect(validatePercentage(50)).toBe(true);
    expect(validatePercentage(100)).toBe(true);
  });

  it('should reject values outside range', () => {
    expect(validatePercentage(-1)).toBe(false);
    expect(validatePercentage(101)).toBe(false);
  });
});

// ============================================================================
// DUPLICATION VALIDATION
// ============================================================================

describe('Validators - Duplication Validation', () => {
  it('should validate acceptable duplication percentages', () => {
    expect(validateDuplication(5, 10)).toBe(true);
    expect(validateDuplication(0, 0)).toBe(true);
    expect(validateDuplication(100, 100)).toBe(true);
  });

  it('should reject invalid duplication values', () => {
    expect(validateDuplication(105, 10)).toBe(false); // Above 100
    expect(validateDuplication(-5, 10)).toBe(false); // Below 0
  });

  it('should reject invalid max allowed values', () => {
    expect(validateDuplication(5, 105)).toBe(false); // maxAllowed above 100
    expect(validateDuplication(5, -10)).toBe(false); // maxAllowed below 0
  });

  it('should require both parameters to be numbers', () => {
    expect(validateDuplication('5' as any, 10)).toBe(false);
    expect(validateDuplication(5, 'ten' as any)).toBe(false);
  });
});

// ============================================================================
// WEIGHT VALIDATION
// ============================================================================

describe('Validators - Weight Validation', () => {
  it('should validate weight in 0-1 range', () => {
    expect(validateWeight(0)).toBe(true);
    expect(validateWeight(0.5)).toBe(true);
    expect(validateWeight(1)).toBe(true);
  });

  it('should reject weight outside range', () => {
    expect(validateWeight(-0.1)).toBe(false);
    expect(validateWeight(1.1)).toBe(false);
  });
});

// ============================================================================
// WEIGHT SUM VALIDATION
// ============================================================================

describe('Validators - Weight Sum Validation', () => {
  it('should validate weights sum to 1.0', () => {
    expect(validateWeightSum([0.25, 0.25, 0.25, 0.25])).toBe(true);
    expect(validateWeightSum([0.3, 0.35, 0.2, 0.15])).toBe(true);
  });

  it('should reject weights not summing to 1.0', () => {
    expect(validateWeightSum([0.25, 0.25, 0.25])).toBe(false);
  });

  it('should allow tolerance', () => {
    expect(validateWeightSum([0.25, 0.25, 0.25, 0.2501], 0.01)).toBe(true);
  });

  it('should reject non-array input', () => {
    expect(validateWeightSum('not an array' as any)).toBe(false);
  });
});

// ============================================================================
// VERSION VALIDATION
// ============================================================================

describe('Validators - Version Validation', () => {
  it('should validate semantic versioning', () => {
    expect(validateVersion('1.0.0')).toBe(true);
    expect(validateVersion('2.5.3')).toBe(true);
    expect(validateVersion('0.0.1')).toBe(true);
  });

  it('should allow extended version strings', () => {
    expect(validateVersion('1.0.0-beta')).toBe(true);
    expect(validateVersion('2.0.0+build')).toBe(true);
  });

  it('should reject invalid format', () => {
    expect(validateVersion('1.0')).toBe(false);
    expect(validateVersion('invalid')).toBe(false);
  });

  it('should require string type', () => {
    expect(validateVersion(100 as any)).toBe(false);
  });
});

// ============================================================================
// URL VALIDATION
// ============================================================================

describe('Validators - URL Validation', () => {
  it('should validate valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://localhost:3000')).toBe(true);
    expect(validateUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('example.com')).toBe(false);
  });

  it('should require string type', () => {
    expect(validateUrl(123 as any)).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateUrl('ftp://files.example.com')).toBe(true);
    expect(validateUrl('file:///path/to/file')).toBe(true);
  });
});
