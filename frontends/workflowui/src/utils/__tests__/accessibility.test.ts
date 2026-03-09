/**
 * Tests for Accessibility Utilities
 */

import { testId, generateTestId, aria, keyboard, validate } from '../accessibility';

describe('accessibility utils', () => {
  describe('testId generators', () => {
    it('should generate nav breadcrumb test ID', () => {
      expect(testId.navBreadcrumb()).toBe('nav-breadcrumb');
    });

    it('should generate nav link test ID', () => {
      expect(testId.navLink('home')).toBe('nav-link-home');
      expect(testId.navLink('settings')).toBe('nav-link-settings');
    });

    it('should generate button test ID', () => {
      expect(testId.button('save')).toBe('button-save');
    });

    it('should generate workflow test ID', () => {
      expect(testId.workflowCard('123')).toBe('workflow-card-123');
    });

    it('should generate canvas test IDs', () => {
      expect(testId.canvasContainer()).toBe('canvas-container');
      expect(testId.canvasGrid()).toBe('canvas-grid');
    });
  });

  describe('generateTestId', () => {
    it('should generate custom test ID from prefix and name', () => {
      expect(generateTestId('custom', 'element')).toBe('custom-element');
    });
  });

  describe('aria utilities', () => {
    it('should create aria-label attribute', () => {
      expect(aria.label('Save button')).toEqual({ 'aria-label': 'Save button' });
    });

    it('should create aria-expanded attribute', () => {
      expect(aria.expanded(true)).toEqual({ 'aria-expanded': true });
    });

    it('should create role attribute', () => {
      expect(aria.role('button')).toEqual({ role: 'button' });
    });
  });

  describe('keyboard constants', () => {
    it('should have correct key values', () => {
      expect(keyboard.enter).toBe('Enter');
      expect(keyboard.escape).toBe('Escape');
    });
  });

  describe('validation utilities', () => {
    it('should validate email addresses', () => {
      expect(validate.email('test@example.com')).toBe(true);
      expect(validate.email('invalid')).toBe(false);
    });

    it('should validate passwords', () => {
      expect(validate.password('password123')).toBe(true);
      expect(validate.password('short')).toBe(false);
    });

    it('should validate URLs', () => {
      expect(validate.url('https://example.com')).toBe(true);
      expect(validate.url('not-a-url')).toBe(false);
    });

    it('should validate required values', () => {
      expect(validate.required('text')).toBe(true);
      expect(validate.required('')).toBe(false);
    });
  });
});
