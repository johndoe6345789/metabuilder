import { describe, expect, it } from 'vitest';
import {
  validateSqlParameter,
  validateSqlTemplateParams,
} from './featureValidators';

describe('featureValidators', () => {
  describe('validateSqlParameter', () => {
    it('should return error for unknown parameter type', () => {
      const result = validateSqlParameter('nonExistentParam', 'value');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown parameter type');
    });

    it('should validate an identifier param type', () => {
      // 'tableName' is a known identifier param in features.json
      const result = validateSqlParameter('tableName', 'users');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('users');
    });

    it('should reject an invalid identifier', () => {
      const result = validateSqlParameter('tableName', '123invalid');
      expect(result.valid).toBe(false);
    });

    it('should validate a dataType enum param', () => {
      const result = validateSqlParameter('dataType', 'INTEGER');
      expect(result.valid).toBe(true);
    });

    it('should reject an invalid enum value', () => {
      const result = validateSqlParameter('dataType', 'FAKETYPE');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid enum value');
    });

    it('should validate an integer param (limit)', () => {
      const result = validateSqlParameter('limit', 10);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(10);
    });

    it('should reject an out-of-range integer', () => {
      // limit min is 1 per features.json
      const result = validateSqlParameter('limit', 0);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateSqlTemplateParams', () => {
    it('should return error for unknown template', () => {
      const result = validateSqlTemplateParams(
        'nonExistent',
        'nonExistentTemplate',
        {},
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Template not found: nonExistent.nonExistentTemplate',
      );
    });

    it('should validate params for a known template', () => {
      // 'tables.listTables' exists in features.json
      const result = validateSqlTemplateParams('tables', 'listTables', {
        schemaName: 'public',
      });
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBeDefined();
    });

    it('should use default values for optional params', () => {
      // schemaName has default 'public'
      const result = validateSqlTemplateParams(
        'tables',
        'listTables',
        {},
      );
      expect(result.valid).toBe(true);
      expect(result.sanitized?.schemaName).toBe('public');
    });

    it('should report missing required parameters', () => {
      // columns.addColumn requires tableName, columnName, dataType - no defaults
      const result = validateSqlTemplateParams(
        'columns',
        'addColumn',
        {},
      );
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('Missing required'))).toBe(
        true,
      );
    });

    it('should report invalid param value', () => {
      const result = validateSqlTemplateParams('columns', 'addColumn', {
        tableName: '123invalid',
        columnName: 'email',
        dataType: 'VARCHAR',
      });
      expect(result.valid).toBe(false);
    });
  });
});
