import { describe, expect, it } from 'vitest';
import { marketingNavigation } from './navigation';
import type { NavigationConfig, NavLink } from './navigation';

describe('marketingNavigation', () => {
  it('should have left and right arrays', () => {
    expect(Array.isArray(marketingNavigation.left)).toBe(true);
    expect(Array.isArray(marketingNavigation.right)).toBe(true);
  });

  it('should have at least one left nav item', () => {
    expect(marketingNavigation.left.length).toBeGreaterThan(0);
  });

  it('should have at least one right nav item', () => {
    expect(marketingNavigation.right.length).toBeGreaterThan(0);
  });

  it('should include a home link in left nav', () => {
    const home = marketingNavigation.left.find(item => item.id === 'home');
    expect(home).toBeDefined();
    expect(home!.href).toBe('/');
  });

  it('should include an external github link', () => {
    const github = marketingNavigation.left.find(item => item.external === true);
    expect(github).toBeDefined();
    expect(github!.href).toContain('github.com');
  });

  it('should have sign-in link in right nav', () => {
    const signIn = marketingNavigation.right.find(item => item.id === 'sign-in');
    expect(signIn).toBeDefined();
    expect(signIn!.href).toContain('sign-in');
  });

  it('each nav link should have required id and href fields', () => {
    const all = [...marketingNavigation.left, ...marketingNavigation.right];
    all.forEach((link: NavLink) => {
      expect(typeof link.id).toBe('string');
      expect(link.id.length).toBeGreaterThan(0);
      expect(typeof link.href).toBe('string');
      expect(link.href.length).toBeGreaterThan(0);
    });
  });

  it('should conform to NavigationConfig type shape', () => {
    const nav: NavigationConfig = marketingNavigation;
    expect(nav).toHaveProperty('left');
    expect(nav).toHaveProperty('right');
  });
});
