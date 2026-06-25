import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDropColumnForm } from './useDropColumnForm';

describe('useDropColumnForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
    onClose = vi.fn();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() =>
      useDropColumnForm(onSubmit, onClose),
    );

    expect(result.current.selected).toBe('');
    expect(result.current.busy).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('should update selected via setSelected', () => {
    const { result } = renderHook(() =>
      useDropColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    expect(result.current.selected).toBe('email');
    expect(result.current.isValid).toBe(true);
  });

  it('isValid should be false for empty string', () => {
    const { result } = renderHook(() =>
      useDropColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('handleClose should reset selected and call onClose', () => {
    const { result } = renderHook(() =>
      useDropColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.selected).toBe('');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('handleSubmit should call onSubmit with columnName', async () => {
    const { result } = renderHook(() =>
      useDropColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ columnName: 'email' });
  });

  it('handleSubmit should reset selected after success', async () => {
    const { result } = renderHook(() =>
      useDropColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.selected).toBe('');
  });

  it('busy should be false after submit resolves', async () => {
    const { result } = renderHook(() =>
      useDropColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setSelected('email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.busy).toBe(false);
  });

  it('busy should be false after submit rejects', async () => {
    const failSubmit = vi.fn().mockRejectedValue(new Error('error'));
    const { result } = renderHook(() =>
      useDropColumnForm(failSubmit, onClose),
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
