import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentTree } from './useComponentTree';

// Mock ComponentTreeRenderer to avoid complex rendering
vi.mock('./componentTreeRenderer', async () => {
  const React = await import('react');
  return {
    ComponentTreeRenderer: ({ tree }: any) =>
      React.createElement('div', { 'data-testid': 'tree-renderer' }, tree.component),
  };
});

const simpleTree = {
  component: 'Box',
  props: { sx: { p: 2 } },
  children: [],
};

describe('useComponentTree', () => {
  it('should initialize with empty data when no initialData provided', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    expect(result.current.data).toEqual({});
  });

  it('should initialize with provided initialData', () => {
    const initialData = { count: 5, name: 'test' };
    const { result } = renderHook(() =>
      useComponentTree(simpleTree, initialData),
    );
    expect(result.current.data).toEqual(initialData);
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    expect(result.current.state).toEqual({});
  });

  it('should expose updateData function', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    expect(typeof result.current.updateData).toBe('function');
  });

  it('should expose updateState function', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    expect(typeof result.current.updateState).toBe('function');
  });

  it('should expose render function', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    expect(typeof result.current.render).toBe('function');
  });

  it('should update data with updateData', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    act(() => {
      result.current.updateData({ newKey: 'newValue' });
    });
    expect(result.current.data.newKey).toBe('newValue');
  });

  it('should merge data with updateData', () => {
    const { result } = renderHook(() =>
      useComponentTree(simpleTree, { existing: 'value' }),
    );
    act(() => {
      result.current.updateData({ newKey: 'added' });
    });
    expect(result.current.data.existing).toBe('value');
    expect(result.current.data.newKey).toBe('added');
  });

  it('should update state with updateState', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    act(() => {
      result.current.updateState({ dialogOpen: true });
    });
    expect(result.current.state.dialogOpen).toBe(true);
  });

  it('should merge state with updateState', () => {
    const { result } = renderHook(() => useComponentTree(simpleTree));
    act(() => {
      result.current.updateState({ a: 1 });
    });
    act(() => {
      result.current.updateState({ b: 2 });
    });
    expect(result.current.state.a).toBe(1);
    expect(result.current.state.b).toBe(2);
  });
});
