import { describe, expect, it } from 'vitest';
import { styles } from './styles';

describe('styles config', () => {
  it('should export a styles object', () => {
    expect(styles).toBeDefined();
    expect(typeof styles).toBe('object');
  });

  it('should have a links section', () => {
    expect(styles.links).toBeDefined();
    expect(typeof styles.links.primary).toBe('string');
    expect(typeof styles.links.primaryBold).toBe('string');
    expect(typeof styles.links.hoverBlue).toBe('string');
    expect(typeof styles.links.nav).toBe('string');
  });

  it('should have a text section', () => {
    expect(styles.text).toBeDefined();
    expect(typeof styles.text.centerSmall).toBe('string');
    expect(typeof styles.text.base).toBe('string');
  });

  it('should have a spacing section', () => {
    expect(styles.spacing).toBeDefined();
    expect(typeof styles.spacing.marginTop2).toBe('string');
    expect(typeof styles.spacing.marginTop3).toBe('string');
    expect(typeof styles.spacing.marginTop5).toBe('string');
  });

  it('should have an image section', () => {
    expect(styles.image).toBeDefined();
    expect(typeof styles.image.centerMarginTop).toBe('string');
  });

  it('should have a headings section', () => {
    expect(styles.headings).toBeDefined();
    expect(typeof styles.headings.h2Bold).toBe('string');
  });

  it('should have a lists section', () => {
    expect(styles.lists).toBeDefined();
    expect(typeof styles.lists.baseMarginTop).toBe('string');
  });

  it('should have a containers section', () => {
    expect(styles.containers).toBeDefined();
    expect(typeof styles.containers.contentPadding).toBe('string');
  });

  it('links.primary should include text-blue-700', () => {
    expect(styles.links.primary).toContain('text-blue-700');
  });
});
