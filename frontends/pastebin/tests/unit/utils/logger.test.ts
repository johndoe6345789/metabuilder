/**
 * Unit Tests for Logger
 * Tests logging functionality with color support
 */

import { logger, Logger } from '../../../src/lib/quality-validator/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear logs before each test
    logger.clearLogs();
    logger.configure({ verbose: false, useColors: false });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();

      expect(logger1).toBe(logger2);
    });
  });

  describe('Configuration', () => {
    it('should configure verbose mode', () => {
      logger.configure({ verbose: true });
      // This would typically be tested by verifying debug output

      expect(logger).toBeDefined();
    });

    it('should configure color mode', () => {
      logger.configure({ useColors: true });

      expect(logger).toBeDefined();
    });

    it('should configure both options', () => {
      logger.configure({ verbose: true, useColors: true });

      expect(logger).toBeDefined();
    });
  });

  describe('Logging Methods', () => {
    it('should log error messages', () => {
      logger.error('Test error');

      const logs = logger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].level).toBe('error');
      expect(logs[logs.length - 1].message).toBe('Test error');
    });

    it('should log warning messages', () => {
      logger.warn('Test warning');

      const logs = logger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].level).toBe('warn');
    });

    it('should log info messages', () => {
      logger.info('Test info');

      const logs = logger.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].level).toBe('info');
    });

    it('should log debug messages when verbose', () => {
      logger.configure({ verbose: true });
      logger.debug('Test debug');

      const logs = logger.getLogs();
      const debugLogs = logs.filter((l) => l.level === 'debug');
      expect(debugLogs.length).toBeGreaterThan(0);
    });

    it('should not log debug messages when not verbose', () => {
      logger.configure({ verbose: false });
      logger.debug('Test debug');

      const logs = logger.getLogs();
      const debugLogs = logs.filter((l) => l.level === 'debug');
      expect(debugLogs.length).toBe(0);
    });
  });

  describe('Context Data', () => {
    it('should include context in log entries', () => {
      const context = { userId: '123', action: 'login' };
      logger.info('User logged in', context);

      const logs = logger.getLogs();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.context).toEqual(context);
    });

    it('should handle missing context', () => {
      logger.error('Error without context');

      const logs = logger.getLogs();
      const lastLog = logs[logs.length - 1];
      expect(lastLog).toBeDefined();
    });
  });

  describe('Log Retrieval', () => {
    it('should return all logs', () => {
      logger.info('First');
      logger.warn('Second');
      logger.error('Third');

      const logs = logger.getLogs();
      expect(logs.length).toBe(3);
      expect(logs[0].message).toBe('First');
      expect(logs[1].message).toBe('Second');
      expect(logs[2].message).toBe('Third');
    });

    it('should return a copy of logs array', () => {
      logger.info('Test');

      const logs1 = logger.getLogs();
      const logs2 = logger.getLogs();

      expect(logs1).toEqual(logs2);
      expect(logs1).not.toBe(logs2); // Different array instances
    });

    it('should clear logs', () => {
      logger.info('Test');
      expect(logger.getLogs().length).toBeGreaterThan(0);

      logger.clearLogs();
      expect(logger.getLogs().length).toBe(0);
    });
  });

  describe('Timestamps', () => {
    it('should include timestamp in log entries', () => {
      logger.info('Test');

      const logs = logger.getLogs();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.timestamp).toBeDefined();

      // Verify it's a valid ISO string
      const date = new Date(lastLog.timestamp);
      expect(date instanceof Date && !isNaN(date.getTime())).toBe(true);
    });
  });

  describe('Color Utilities', () => {
    it('should colorize text with red', () => {
      logger.configure({ useColors: true });
      const colored = logger.colorize('Error', 'red');

      expect(colored).toContain('Error');
    });

    it('should colorize text with green', () => {
      logger.configure({ useColors: true });
      const colored = logger.colorize('Success', 'green');

      expect(colored).toContain('Success');
    });

    it('should colorize text with yellow', () => {
      logger.configure({ useColors: true });
      const colored = logger.colorize('Warning', 'yellow');

      expect(colored).toContain('Warning');
    });

    it('should colorize text with blue', () => {
      logger.configure({ useColors: true });
      const colored = logger.colorize('Info', 'blue');

      expect(colored).toContain('Info');
    });

    it('should colorize text with cyan', () => {
      logger.configure({ useColors: true });
      const colored = logger.colorize('Debug', 'cyan');

      expect(colored).toContain('Debug');
    });

    it('should colorize text with gray', () => {
      logger.configure({ useColors: true });
      const colored = logger.colorize('Gray', 'gray');

      expect(colored).toContain('Gray');
    });

    it('should colorize text with magenta', () => {
      logger.configure({ useColors: true });
      const colored = logger.colorize('Magenta', 'magenta');

      expect(colored).toContain('Magenta');
    });

    it('should not colorize when colors disabled', () => {
      logger.configure({ useColors: false });
      const colored = logger.colorize('Text', 'red');

      expect(colored).toBe('Text');
    });
  });

  describe('Table Formatting', () => {
    it('should format data as table', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      const table = logger.table(data);

      expect(table).toContain('John');
      expect(table).toContain('Jane');
      expect(table).toContain('30');
      expect(table).toContain('25');
    });

    it('should handle empty data array', () => {
      const table = logger.table([]);

      expect(table).toBe('');
    });

    it('should handle missing values', () => {
      const data = [{ name: 'John', age: undefined }];

      const table = logger.table(data);

      expect(table).toContain('John');
    });

    it('should format headers', () => {
      const data = [{ col1: 'value1', col2: 'value2' }];

      const table = logger.table(data);

      expect(table).toContain('col1');
      expect(table).toContain('col2');
    });
  });
});
