/**
 * Tests for canvasUtils – formatting helpers
 */

import {
  formatDate,
  getStatusColor,
  getStatusBorderColor,
} from '../canvasUtils';

// Freeze time so relative-time assertions are stable
const NOW = 1_700_000_000_000; // arbitrary fixed timestamp

describe('formatDate', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns "just now" for timestamps less than 1 minute ago', () => {
    expect(formatDate(NOW - 30_000)).toBe('just now');
    expect(formatDate(NOW - 59_000)).toBe('just now');
  });

  it('returns minutes ago for timestamps < 60 minutes ago', () => {
    expect(formatDate(NOW - 5 * 60_000)).toBe('5m ago');
    expect(formatDate(NOW - 59 * 60_000)).toBe('59m ago');
  });

  it('returns hours ago for timestamps 1–23 hours ago', () => {
    expect(formatDate(NOW - 2 * 60 * 60_000)).toBe('2h ago');
    expect(formatDate(NOW - 23 * 60 * 60_000)).toBe('23h ago');
  });

  it('returns days ago for timestamps >= 24 hours ago', () => {
    expect(formatDate(NOW - 25 * 60 * 60_000)).toBe('1d ago');
    expect(formatDate(NOW - 48 * 60 * 60_000)).toBe('2d ago');
  });

  it('handles exactly 0ms diff as "just now"', () => {
    expect(formatDate(NOW)).toBe('just now');
  });
});

describe('getStatusColor', () => {
  it('returns "success" for published status', () => {
    expect(getStatusColor('published')).toBe('success');
  });

  it('returns "success" for active status', () => {
    expect(getStatusColor('active')).toBe('success');
  });

  it('returns "info" for draft status', () => {
    expect(getStatusColor('draft')).toBe('info');
  });

  it('returns "warning" for paused status', () => {
    expect(getStatusColor('paused')).toBe('warning');
  });

  it('returns "error" for unknown statuses', () => {
    expect(getStatusColor('deprecated')).toBe('error');
    expect(getStatusColor('unknown')).toBe('error');
    expect(getStatusColor('')).toBe('error');
  });
});

describe('getStatusBorderColor', () => {
  it('returns success color for published', () => {
    expect(getStatusBorderColor('published')).toBe(
      'var(--md-sys-color-success)'
    );
  });

  it('returns success color for active', () => {
    expect(getStatusBorderColor('active')).toBe(
      'var(--md-sys-color-success)'
    );
  });

  it('returns primary color for draft', () => {
    expect(getStatusBorderColor('draft')).toBe(
      'var(--md-sys-color-primary)'
    );
  });

  it('returns warning color for paused', () => {
    expect(getStatusBorderColor('paused')).toBe(
      'var(--md-sys-color-warning)'
    );
  });

  it('returns error color for unknown statuses', () => {
    expect(getStatusBorderColor('deprecated')).toBe(
      'var(--md-sys-color-error)'
    );
    expect(getStatusBorderColor('unknown')).toBe(
      'var(--md-sys-color-error)'
    );
  });
});
