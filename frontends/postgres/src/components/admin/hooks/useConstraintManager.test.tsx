import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { useConstraintManager } from './useConstraintManager';

describe('useConstraintManager', () => {
  let onAddConstraint: ReturnType<typeof vi.fn>;
  let onDropConstraint: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    onAddConstraint = vi.fn().mockResolvedValue(undefined);
    onDropConstraint = vi.fn().mockResolvedValue(undefined);
  });

  const setup = () =>
    renderHook(() =>
      useConstraintManager(onAddConstraint, onDropConstraint),
    );

  it('should return initial state', () => {
    vi.stubGlobal('fetch', vi.fn());
    const { result } = setup();

    expect(result.current.selectedTable).toBe('');
    expect(result.current.constraints).toEqual([]);
    expect(result.current.dialogState).toEqual({
      open: false,
      mode: 'add',
    });
    expect(result.current.selectedConstraint).toBeNull();
  });

  it('should fetch constraints when selectedTable changes', async () => {
    const constraints = [
      { constraint_name: 'pk_id', constraint_type: 'PRIMARY KEY' },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ constraints }),
      }),
    );

    const { result } = setup();

    act(() => {
      result.current.setSelectedTable('users');
    });

    await waitFor(() => {
      expect(result.current.constraints).toHaveLength(1);
    });

    expect(result.current.constraints[0].constraint_name).toBe('pk_id');
  });

  it('should clear constraints when selectedTable is emptied', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const { result } = setup();

    act(() => {
      result.current.setSelectedTable('');
    });

    expect(result.current.constraints).toEqual([]);
  });

  it('openAddDialog should open dialog in add mode', () => {
    vi.stubGlobal('fetch', vi.fn());

    const { result } = setup();

    act(() => {
      result.current.openAddDialog();
    });

    expect(result.current.dialogState).toEqual({
      open: true,
      mode: 'add',
    });
    expect(result.current.selectedConstraint).toBeNull();
  });

  it('openDeleteDialog should open dialog with constraint', () => {
    vi.stubGlobal('fetch', vi.fn());

    const { result } = setup();
    const constraint = { constraint_name: 'pk_id' };

    act(() => {
      result.current.openDeleteDialog(constraint);
    });

    expect(result.current.dialogState).toEqual({
      open: true,
      mode: 'delete',
    });
    expect(result.current.selectedConstraint).toEqual(constraint);
  });

  it('closeDialog should close the dialog and clear selectedConstraint', () => {
    vi.stubGlobal('fetch', vi.fn());

    const { result } = setup();
    const constraint = { constraint_name: 'pk_id' };

    act(() => {
      result.current.openDeleteDialog(constraint);
    });

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.dialogState.open).toBe(false);
    expect(result.current.selectedConstraint).toBeNull();
  });

  it('handleConstraintOperation in add mode calls onAddConstraint', async () => {
    const constraints: any[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ constraints }),
      }),
    );

    const { result } = setup();

    act(() => {
      result.current.setSelectedTable('users');
      result.current.openAddDialog();
    });

    await act(async () => {
      await result.current.handleConstraintOperation({
        type: 'UNIQUE',
        column: 'email',
      });
    });

    expect(onAddConstraint).toHaveBeenCalledWith('users', {
      type: 'UNIQUE',
      column: 'email',
    });
  });

  it('handleConstraintOperation in delete mode calls onDropConstraint', async () => {
    const constraint = { constraint_name: 'uq_email' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ constraints: [] }),
      }),
    );

    const { result } = setup();

    act(() => {
      result.current.setSelectedTable('users');
      result.current.openDeleteDialog(constraint);
    });

    await act(async () => {
      await result.current.handleConstraintOperation({});
    });

    expect(onDropConstraint).toHaveBeenCalledWith('users', 'uq_email');
  });
});
