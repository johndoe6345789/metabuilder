import { describe, expect, it } from 'vitest';
import {
  evaluateCondition,
  getNestedValue,
  interpolateValue,
  resolvePath,
} from './componentTreeHelpers';
import type { RenderContext } from './componentTreeHelpers';

describe('componentTreeHelpers', () => {
  describe('resolvePath', () => {
    it('should resolve a simple single-key path', () => {
      const obj = { name: 'Alice' };
      expect(resolvePath(obj, 'name')).toBe('Alice');
    });

    it('should resolve a nested dot-notation path', () => {
      const obj = { user: { profile: { age: 30 } } };
      expect(resolvePath(obj, 'user.profile.age')).toBe(30);
    });

    it('should resolve array index notation', () => {
      const obj = { items: ['a', 'b', 'c'] };
      expect(resolvePath(obj, 'items[1]')).toBe('b');
    });

    it('should resolve nested array access with dot notation', () => {
      const obj = { users: [{ name: 'Bob' }, { name: 'Alice' }] };
      expect(resolvePath(obj, 'users[0].name')).toBe('Bob');
    });

    it('should return undefined for missing keys', () => {
      const obj = { a: 1 };
      expect(resolvePath(obj, 'b')).toBeUndefined();
    });

    it('should return undefined for deeply missing paths', () => {
      const obj = { a: { b: 1 } };
      expect(resolvePath(obj, 'a.c.d')).toBeUndefined();
    });

    it('should handle null/undefined root gracefully', () => {
      expect(resolvePath(null, 'key')).toBeUndefined();
      expect(resolvePath(undefined, 'key')).toBeUndefined();
    });
  });

  describe('getNestedValue', () => {
    it('should resolve a direct path', () => {
      const context = { name: 'Alice', data: { age: 25 } };
      expect(getNestedValue(context, 'name')).toBe('Alice');
    });

    it('should fall back to context.data when direct lookup misses', () => {
      const context: RenderContext = {
        data: { message: 'Hello' },
        actions: {},
        state: {},
      };
      expect(getNestedValue(context, 'message')).toBe('Hello');
    });

    it('should return direct value before falling back', () => {
      const context = {
        value: 'direct',
        data: { value: 'nested' },
      };
      expect(getNestedValue(context, 'value')).toBe('direct');
    });

    it('should return undefined when path not found anywhere', () => {
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      expect(getNestedValue(context, 'missing')).toBeUndefined();
    });
  });

  describe('interpolateValue', () => {
    const context: RenderContext = {
      data: { name: 'World', count: 42 },
      actions: {},
      state: {},
    };

    it('should return non-string values unchanged', () => {
      expect(interpolateValue(42, context)).toBe(42);
      expect(interpolateValue(true, context)).toBe(true);
      expect(interpolateValue(null, context)).toBeNull();
      expect(interpolateValue({ a: 1 }, context)).toEqual({ a: 1 });
    });

    it('should replace a whole-value template {{...}}', () => {
      expect(interpolateValue('{{data.name}}', context)).toBe('World');
    });

    it('should replace a whole-value template returning a number', () => {
      expect(interpolateValue('{{data.count}}', context)).toBe(42);
    });

    it('should interpolate inline template tokens', () => {
      expect(
        interpolateValue('Hello {{data.name}}!', context),
      ).toBe('Hello World!');
    });

    it('should handle string with multiple templates (greedy regex behaviour)', () => {
      // The whole-template regex uses greedy .+ so '{{a}}: {{b}}' matches
      // ^{{(.+)}}$ capturing 'a}}: {{b', and getNestedValue returns undefined.
      // This documents current behavior.
      const result = interpolateValue('{{data.name}}: {{data.count}}', context);
      // With the current greedy regex the captured path doesn't resolve
      expect(result).toBeUndefined();
    });

    it('should replace missing token with empty string in inline mode', () => {
      expect(
        interpolateValue('Hello {{data.missing}}!', context),
      ).toBe('Hello !');
    });

    it('should return plain string without tokens unchanged', () => {
      expect(interpolateValue('plain text', context)).toBe('plain text');
    });
  });

  describe('evaluateCondition', () => {
    it('should return true for truthy values', () => {
      const context: RenderContext = {
        data: { show: true },
        actions: {},
        state: {},
      };
      expect(evaluateCondition('data.show', context)).toBe(true);
    });

    it('should return false for false boolean', () => {
      const context: RenderContext = {
        data: { show: false },
        actions: {},
        state: {},
      };
      expect(evaluateCondition('data.show', context)).toBe(false);
    });

    it('should return false for undefined condition path', () => {
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      expect(evaluateCondition('data.missing', context)).toBe(false);
    });

    it('should return true for non-empty string (truthy)', () => {
      const context: RenderContext = {
        data: { label: 'hello' },
        actions: {},
        state: {},
      };
      expect(evaluateCondition('data.label', context)).toBe(true);
    });

    it('should return false for zero (falsy)', () => {
      const context: RenderContext = {
        data: { count: 0 },
        actions: {},
        state: {},
      };
      expect(evaluateCondition('data.count', context)).toBe(false);
    });
  });
});
