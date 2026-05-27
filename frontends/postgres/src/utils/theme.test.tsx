import { describe, expect, it } from 'vitest';
import { theme } from './theme';

describe('theme', () => {
  it('should be defined', () => {
    expect(theme).toBeDefined();
  });

  it('should have a dark palette mode', () => {
    expect(theme.palette.mode).toBe('dark');
  });

  it('should have a primary color', () => {
    expect(theme.palette.primary.main).toBeDefined();
    expect(typeof theme.palette.primary.main).toBe('string');
  });

  it('should have a secondary color', () => {
    expect(theme.palette.secondary.main).toBeDefined();
  });

  it('should have background colors defined', () => {
    expect(theme.palette.background.default).toBeDefined();
    expect(theme.palette.background.paper).toBeDefined();
  });

  it('should have typography fontFamily defined', () => {
    expect(theme.typography.fontFamily).toBeDefined();
    expect(theme.typography.fontFamily).toContain('Inter');
  });

  it('should have a border radius defined', () => {
    expect(theme.shape.borderRadius).toBe(12);
  });
});
