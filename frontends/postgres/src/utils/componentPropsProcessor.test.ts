import { describe, expect, it, vi } from 'vitest';
import { processProps } from './componentPropsProcessor';
import type { RenderContext } from './componentTreeHelpers';

describe('componentPropsProcessor', () => {
  describe('processProps', () => {
    it('should return empty object for empty props', () => {
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      expect(processProps({}, context)).toEqual({});
    });

    it('should interpolate string values', () => {
      const context: RenderContext = {
        data: { name: 'Alice' },
        actions: {},
        state: {},
      };
      const result = processProps({ label: '{{data.name}}' }, context);
      expect(result.label).toBe('Alice');
    });

    it('should pass non-string values unchanged', () => {
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      const result = processProps({ count: 42, active: true }, context);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
    });

    it('should map string onClick to action function', () => {
      const handleClick = vi.fn();
      const context: RenderContext = {
        data: {},
        actions: { handleClick },
        state: {},
      };
      const result = processProps({ onClick: 'handleClick' }, context);
      expect(result.onClick).toBe(handleClick);
    });

    it('should map string onChange to action function', () => {
      const handleChange = vi.fn();
      const context: RenderContext = {
        data: {},
        actions: { handleChange },
        state: {},
      };
      const result = processProps({ onChange: 'handleChange' }, context);
      expect(result.onChange).toBe(handleChange);
    });

    it('should map onClick from handlers when not in actions', () => {
      const handleClick = vi.fn();
      const context: RenderContext = {
        data: {},
        actions: {},
        handlers: { handleClick },
        state: {},
      };
      const result = processProps({ onClick: 'handleClick' }, context);
      expect(result.onClick).toBe(handleClick);
    });

    it('should pass non-string onClick unchanged', () => {
      const fn = vi.fn();
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      const result = processProps({ onClick: fn }, context);
      expect(result.onClick).toBe(fn);
    });

    it('should resolve icon name to a React element for startIcon', () => {
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      const result = processProps({ startIcon: 'Add' }, context);
      // React element has a $$typeof property
      expect(result.startIcon).toBeDefined();
      expect(result.startIcon?.$$typeof).toBeDefined();
    });

    it('should skip icon prop when icon name is unknown', () => {
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      const result = processProps(
        { startIcon: 'NonExistentIcon99999' },
        context,
      );
      // Unknown icon → prop is not set
      expect(result.startIcon).toBeUndefined();
    });

    it('should recursively process nested object props', () => {
      const context: RenderContext = {
        data: { padding: 2 },
        actions: {},
        state: {},
      };
      const result = processProps(
        { sx: { p: '{{data.padding}}' } },
        context,
      );
      expect(result.sx.p).toBe(2);
    });

    it('should pass arrays unchanged (no recursive processing)', () => {
      const context: RenderContext = {
        data: {},
        actions: {},
        state: {},
      };
      const arr = [1, 2, 3];
      const result = processProps({ items: arr }, context);
      expect(result.items).toBe(arr);
    });
  });
});
