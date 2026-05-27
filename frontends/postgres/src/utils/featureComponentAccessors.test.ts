import { describe, expect, it } from 'vitest';
import {
  getAllSqlTemplates,
  getSqlParameterType,
  getSqlParameterTypes,
  getSqlQueryTemplate,
  getSqlTemplatesByCategory,
} from './featureComponentAccessors';

describe('featureComponentAccessors – SQL accessors', () => {
  describe('getSqlParameterType', () => {
    it('should return tableName param type', () => {
      const pt = getSqlParameterType('tableName');
      expect(pt).toBeDefined();
      expect(pt?.type).toBe('identifier');
    });

    it('should return limit param type', () => {
      const pt = getSqlParameterType('limit');
      expect(pt).toBeDefined();
      expect(pt?.type).toBe('integer');
    });

    it('should return undefined for unknown param', () => {
      expect(getSqlParameterType('nonExistentParam')).toBeUndefined();
    });
  });

  describe('getSqlParameterTypes', () => {
    it('should return a non-empty object', () => {
      const types = getSqlParameterTypes();
      expect(typeof types).toBe('object');
      expect(Object.keys(types).length).toBeGreaterThan(0);
    });

    it('should include tableName', () => {
      const types = getSqlParameterTypes();
      expect(types.tableName).toBeDefined();
    });
  });

  describe('getSqlQueryTemplate', () => {
    it('should return template for tables.listTables', () => {
      const tpl = getSqlQueryTemplate('tables', 'listTables');
      expect(tpl).toBeDefined();
      expect(tpl?.description).toBeDefined();
      expect(tpl?.parameters).toBeDefined();
    });

    it('should return undefined for non-existent template', () => {
      expect(
        getSqlQueryTemplate('nonExistentCat', 'nonExistentTemplate'),
      ).toBeUndefined();
    });
  });

  describe('getAllSqlTemplates', () => {
    it('should return the full SQL templates object', () => {
      const templates = getAllSqlTemplates();
      expect(templates).toBeDefined();
      expect(templates?.parameterTypes).toBeDefined();
      expect(templates?.queries).toBeDefined();
    });
  });

  describe('getSqlTemplatesByCategory', () => {
    it('should return templates for the tables category', () => {
      const templates = getSqlTemplatesByCategory('tables');
      expect(typeof templates).toBe('object');
      expect(Object.keys(templates).length).toBeGreaterThan(0);
    });

    it('should return empty object for non-existent category', () => {
      const templates = getSqlTemplatesByCategory('nonExistentCategory');
      expect(templates).toEqual({});
    });

    it('should include listTables in tables category', () => {
      const templates = getSqlTemplatesByCategory('tables');
      expect(templates.listTables).toBeDefined();
    });
  });
});
