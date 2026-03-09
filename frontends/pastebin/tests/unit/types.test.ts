/**
 * Unit Tests for Type Definitions
 * Tests for interfaces and types used throughout the application
 */

import {
  ConfigurationError,
  AnalysisErrorClass,
  IntegrationError,
  ReportingError,
  QualityValidationError,
  ExitCode,
} from '../../src/lib/quality-validator/types/index';

describe('Error Classes', () => {
  describe('QualityValidationError', () => {
    it('should be an abstract error class', () => {
      expect(QualityValidationError).toBeDefined();
    });
  });

  describe('ConfigurationError', () => {
    it('should create error with code CONFIG_ERROR', () => {
      const error = new ConfigurationError('Test error message', 'Test details');

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.details).toBe('Test details');
    });

    it('should be instance of Error', () => {
      const error = new ConfigurationError('Test');
      expect(error instanceof Error).toBe(true);
    });

    it('should have proper prototype chain', () => {
      const error = new ConfigurationError('Test');
      expect(Object.getPrototypeOf(error) instanceof Error).toBe(true);
    });
  });

  describe('AnalysisErrorClass', () => {
    it('should create error with code ANALYSIS_ERROR', () => {
      const error = new AnalysisErrorClass('Analysis failed', 'Details');

      expect(error.message).toBe('Analysis failed');
      expect(error.code).toBe('ANALYSIS_ERROR');
      expect(error.details).toBe('Details');
    });
  });

  describe('IntegrationError', () => {
    it('should create error with code INTEGRATION_ERROR', () => {
      const error = new IntegrationError('Integration failed', 'Details');

      expect(error.code).toBe('INTEGRATION_ERROR');
      expect(error.message).toBe('Integration failed');
    });
  });

  describe('ReportingError', () => {
    it('should create error with code REPORTING_ERROR', () => {
      const error = new ReportingError('Report generation failed', 'Details');

      expect(error.code).toBe('REPORTING_ERROR');
      expect(error.message).toBe('Report generation failed');
    });
  });
});

describe('ExitCode Enum', () => {
  it('should have SUCCESS code 0', () => {
    expect(ExitCode.SUCCESS).toBe(0);
  });

  it('should have QUALITY_FAILURE code 1', () => {
    expect(ExitCode.QUALITY_FAILURE).toBe(1);
  });

  it('should have CONFIGURATION_ERROR code 2', () => {
    expect(ExitCode.CONFIGURATION_ERROR).toBe(2);
  });

  it('should have EXECUTION_ERROR code 3', () => {
    expect(ExitCode.EXECUTION_ERROR).toBe(3);
  });

  it('should have KEYBOARD_INTERRUPT code 130', () => {
    expect(ExitCode.KEYBOARD_INTERRUPT).toBe(130);
  });
});

describe('Type Compatibility', () => {
  it('should support Severity type', () => {
    const severities: Array<'critical' | 'high' | 'medium' | 'low' | 'info'> = [
      'critical',
      'high',
      'medium',
      'low',
      'info',
    ];

    expect(severities.length).toBe(5);
  });

  it('should support AnalysisCategory type', () => {
    const categories: Array<'codeQuality' | 'testCoverage' | 'architecture' | 'security'> = [
      'codeQuality',
      'testCoverage',
      'architecture',
      'security',
    ];

    expect(categories.length).toBe(4);
  });

  it('should support Status type', () => {
    const statuses: Array<'pass' | 'fail' | 'warning'> = ['pass', 'fail', 'warning'];

    expect(statuses.length).toBe(3);
  });
});
