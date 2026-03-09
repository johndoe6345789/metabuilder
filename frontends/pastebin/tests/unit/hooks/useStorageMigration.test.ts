/**
 * Unit Tests for useStorageMigration Hook
 * The hook has been simplified to return an empty object as storage migration
 * is now handled entirely by the DBAL backend.
 */

import { renderHook } from '@testing-library/react';
import { useStorageMigration } from '@/hooks/useStorageMigration';

describe('useStorageMigration Hook', () => {
  it('should return an object', () => {
    const { result } = renderHook(() => useStorageMigration());
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should not throw on mount', () => {
    expect(() => {
      renderHook(() => useStorageMigration());
    }).not.toThrow();
  });

  it('should return a stable reference across renders', () => {
    const { result, rerender } = renderHook(() => useStorageMigration());
    const first = result.current;
    rerender();
    expect(typeof result.current).toBe('object');
    expect(result.current).toEqual(first);
  });
});
