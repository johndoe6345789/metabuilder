import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModifyColumnForm } from './useModifyColumnForm';

describe('useModifyColumnForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
    onClose = vi.fn();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    expect(result.current.selected).toBe('');
    expect(result.current.type).toBe('VARCHAR');
    expect(result.current.nullable).toBe(true);
    expect(result.current.busy).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('should update selected via setSelected', () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    expect(result.current.selected).toBe('email');
    expect(result.current.isValid).toBe(true);
  });

  it('should update type via setType', () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setType('TEXT');
    });

    expect(result.current.type).toBe('TEXT');
  });

  it('should update nullable via setNullable', () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setNullable(false);
    });

    expect(result.current.nullable).toBe(false);
  });

  it('handleClose should reset and call onClose', () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
      result.current.setType('TEXT');
      result.current.setNullable(false);
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.selected).toBe('');
    expect(result.current.type).toBe('VARCHAR');
    expect(result.current.nullable).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('handleSubmit should call onSubmit with correct data', async () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
      result.current.setType('TEXT');
      result.current.setNullable(false);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      columnName: 'email',
      newType: 'TEXT',
      nullable: false,
    });
  });

  it('handleSubmit should reset state after success', async () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.selected).toBe('');
    expect(result.current.type).toBe('VARCHAR');
    expect(result.current.nullable).toBe(true);
  });

  it('busy should be false after submit completes', async () => {
    const { result } = renderHook(() =>
      useModifyColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.busy).toBe(false);
  });

  it('busy should be false even when submit rejects', async () => {
    const failSubmit = vi.fn().mockRejectedValue(new Error('server error'));
    const { result } = renderHook(() =>
      useModifyColumnForm(failSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    await act(async () => {
      try {
        await result.current.handleSubmit();
      } catch {
        // expected
      }
    });

    expect(result.current.busy).toBe(false);
  });
});
