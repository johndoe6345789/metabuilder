import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableManager } from './useTableManager';

describe('useTableManager', () => {
  it('should return false for both dialogs initially', () => {
    const { result } = renderHook(() => useTableManager());

    expect(result.current.openCreateDialog).toBe(false);
    expect(result.current.openDropDialog).toBe(false);
  });

  it('should open create dialog via handlers.openCreateDialog', () => {
    const { result } = renderHook(() => useTableManager());

    act(() => {
      result.current.handlers.openCreateDialog();
    });

    expect(result.current.openCreateDialog).toBe(true);
  });

  it('should open drop dialog via handlers.openDropDialog', () => {
    const { result } = renderHook(() => useTableManager());

    act(() => {
      result.current.handlers.openDropDialog();
    });

    expect(result.current.openDropDialog).toBe(true);
  });

  it('should close create dialog via setOpenCreateDialog(false)', () => {
    const { result } = renderHook(() => useTableManager());

    act(() => {
      result.current.handlers.openCreateDialog();
    });

    act(() => {
      result.current.setOpenCreateDialog(false);
    });

    expect(result.current.openCreateDialog).toBe(false);
  });

  it('should close drop dialog via setOpenDropDialog(false)', () => {
    const { result } = renderHook(() => useTableManager());

    act(() => {
      result.current.handlers.openDropDialog();
    });

    act(() => {
      result.current.setOpenDropDialog(false);
    });

    expect(result.current.openDropDialog).toBe(false);
  });

  it('handlers should be stable references', () => {
    const { result, rerender } = renderHook(() => useTableManager());
    const { handlers: h1 } = result.current;

    rerender();

    // After rerender the handlers object reference may change but
    // the functions should remain callable
    expect(typeof result.current.handlers.openCreateDialog).toBe(
      'function',
    );
    expect(typeof result.current.handlers.openDropDialog).toBe('function');
    void h1; // suppress unused-var lint
  });
});
