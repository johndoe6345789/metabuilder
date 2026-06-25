import { describe, expect, it } from 'vitest';
import { componentRegistry, resolveIcon, iconOverrides } from './componentRegistry';

describe('componentRegistry', () => {
  it('should export a non-empty registry', () => {
    expect(typeof componentRegistry).toBe('object');
    expect(Object.keys(componentRegistry).length).toBeGreaterThan(0);
  });

  it('should contain core MUI components', () => {
    const expected = [
      'Button', 'Typography', 'Box', 'Paper', 'Table',
      'TextField', 'Select', 'Dialog', 'List', 'Chip',
    ];
    expected.forEach((name) => {
      expect(componentRegistry[name]).toBeDefined();
      const comp = componentRegistry[name];
      expect(typeof comp === 'function' || typeof comp === 'object').toBe(true);
    });
  });

  it('should contain table sub-components', () => {
    expect(componentRegistry['TableRow']).toBeDefined();
    expect(componentRegistry['TableCell']).toBeDefined();
    expect(componentRegistry['TableHead']).toBeDefined();
    expect(componentRegistry['TableBody']).toBeDefined();
  });

  it('should re-export resolveIcon', () => {
    expect(typeof resolveIcon).toBe('function');
  });

  it('should re-export iconOverrides', () => {
    expect(typeof iconOverrides).toBe('object');
  });
});
