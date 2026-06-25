import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddColumnForm } from './useAddColumnForm';

describe('useAddColumnForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
    onClose = vi.fn();
  });

  it('should return default initial state', () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    expect(result.current.name).toBe('');
    expect(result.current.type).toBe('VARCHAR');
    expect(result.current.nullable).toBe(true);
    expect(result.current.defaultVal).toBe('');
    expect(result.current.busy).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('should update name via setName', () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('email');
    });

    expect(result.current.name).toBe('email');
    expect(result.current.isValid).toBe(true);
  });

  it('should update type via setType', () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setType('INTEGER');
    });

    expect(result.current.type).toBe('INTEGER');
  });

  it('should update nullable via setNullable', () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setNullable(false);
    });

    expect(result.current.nullable).toBe(false);
  });

  it('should update defaultVal via setDefaultVal', () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setDefaultVal('now()');
    });

    expect(result.current.defaultVal).toBe('now()');
  });

  it('isValid should be false when name is only whitespace', () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('   ');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('handleClose should reset state and call onClose', () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('email');
      result.current.setType('TEXT');
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.name).toBe('');
    expect(result.current.type).toBe('VARCHAR');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('handleSubmit should call onSubmit with correct data', async () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('email');
      result.current.setType('TEXT');
      result.current.setNullable(false);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      columnName: 'email',
      dataType: 'TEXT',
      nullable: false,
    });
  });

  it('handleSubmit should include defaultValue when set', async () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('created_at');
      result.current.setDefaultVal('now()');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ defaultValue: 'now()' }),
    );
  });

  it('handleSubmit should omit defaultValue when not set', async () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('created_at');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    const callArgs = onSubmit.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty('defaultValue');
  });

  it('handleSubmit should reset form after success', async () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.name).toBe('');
    expect(result.current.type).toBe('VARCHAR');
  });

  it('busy should be false after submit resolves', async () => {
    const { result } = renderHook(() =>
      useAddColumnForm(onSubmit, onClose),
    );

    act(() => {
      result.current.setName('email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.busy).toBe(false);
  });

  it('busy should be false even after submit rejects', async () => {
    const failSubmit = vi.fn().mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() =>
      useAddColumnForm(failSubmit, onClose),
    );

    act(() => {
      result.current.setName('email');
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
