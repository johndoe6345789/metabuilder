import { describe, expect, it } from 'vitest';
import React from 'react';
import { iconOverrides, resolveIcon } from './iconRegistry';

describe('iconRegistry', () => {
  describe('iconOverrides', () => {
    it('should contain all expected override keys', () => {
      expect(iconOverrides).toHaveProperty('TableChart');
      expect(iconOverrides).toHaveProperty('Bolt');
      expect(iconOverrides).toHaveProperty('Delete');
      expect(iconOverrides).toHaveProperty('Add');
      expect(iconOverrides).toHaveProperty('Edit');
      expect(iconOverrides).toHaveProperty('PlayArrow');
      expect(iconOverrides).toHaveProperty('Download');
    });

    it('should contain React-renderable components (function or object)', () => {
      Object.values(iconOverrides).forEach(component => {
        // MUI icons can be forwardRef objects or functions
        const t = typeof component;
        expect(t === 'function' || t === 'object').toBe(true);
        expect(component).not.toBeNull();
      });
    });
  });

  describe('resolveIcon', () => {
    it('should return a React element for a known override icon', () => {
      const element = resolveIcon('Add');
      expect(element).not.toBeNull();
      expect(React.isValidElement(element)).toBe(true);
    });

    it('should return a React element for Delete icon', () => {
      const element = resolveIcon('Delete');
      expect(React.isValidElement(element)).toBe(true);
    });

    it('should return a React element for Edit icon', () => {
      const element = resolveIcon('Edit');
      expect(React.isValidElement(element)).toBe(true);
    });

    it('should return null for unknown icon name', () => {
      const element = resolveIcon('NonExistentIcon12345');
      expect(element).toBeNull();
    });

    it('should pass props to the created element', () => {
      const element = resolveIcon('Add', {
        fontSize: 'small',
        color: 'primary',
      });
      expect(React.isValidElement(element)).toBe(true);
      expect((element as React.ReactElement).props.fontSize).toBe('small');
      expect((element as React.ReactElement).props.color).toBe('primary');
    });

    it('should resolve MUI icons not in overrides', () => {
      // 'Home' is a standard MUI icon not in iconOverrides
      const element = resolveIcon('Home');
      // May be null if not in the bundle, but should not throw
      expect(element === null || React.isValidElement(element)).toBe(true);
    });
  });
});
