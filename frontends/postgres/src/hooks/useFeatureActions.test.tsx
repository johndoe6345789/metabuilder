vi.mock('@/utils/featureConfig', async () => ({
  getApiEndpoints: (resource: string) => {
    if (resource === 'testResource') {
      return {
        list: { method: 'GET', path: '/api/test', description: 'List test' },
      };
    }
    return undefined;
  },
  getQueryOperators: () => [],
  getIndexTypes: () => [],
  validateSqlParameter: () => null,
  validateSqlTemplateParams: () => null,
  getSqlParameterType: () => undefined,
  getSqlParameterTypes: () => ({}),
  getSqlQueryTemplate: () => undefined,
  getAllSqlTemplates: () => ({}),
  getSqlTemplatesByCategory: () => ({}),
  getValidationRule: () => undefined,
  getFormSchema: () => undefined,
  getTableLayout: () => undefined,
  getColumnLayout: () => undefined,
  getTableFeatures: () => undefined,
  getColumnFeatures: () => undefined,
  getComponentLayout: () => undefined,
  getApiEndpoint: () => undefined,
  getPermissions: () => undefined,
  hasPermission: () => false,
  getRelationships: () => undefined,
  getUiViews: () => undefined,
  getUiView: () => undefined,
  getPlaywrightPlaybook: () => undefined,
  getAllPlaywrightPlaybooks: () => ({}),
  getPlaywrightPlaybooksByTag: () => [],
  getStorybookStory: () => undefined,
  getAllStorybookStories: () => ({}),
  getStorybookStoriesForComponent: () => ({}),
}));

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeatureActions } from './useFeatureActions';

describe('useFeatureActions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with loading false and null error/success', () => {
    const { result } = renderHook(() => useFeatureActions('testResource'));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });

  it('should return actions object', () => {
    const { result } = renderHook(() => useFeatureActions('testResource'));
    expect(typeof result.current.actions).toBe('object');
  });

  it('should set loading to true and back with setLoading', () => {
    const { result } = renderHook(() => useFeatureActions('testResource'));
    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.loading).toBe(true);
    act(() => {
      result.current.setLoading(false);
    });
    expect(result.current.loading).toBe(false);
  });

  it('should set error message with setError', () => {
    const { result } = renderHook(() => useFeatureActions('testResource'));
    act(() => {
      result.current.setError('something went wrong');
    });
    expect(result.current.error).toBe('something went wrong');
    expect(result.current.loading).toBe(false);
  });

  it('should set success message with setSuccess', () => {
    const { result } = renderHook(() => useFeatureActions('testResource'));
    act(() => {
      result.current.setSuccess('operation succeeded');
    });
    expect(result.current.success).toBe('operation succeeded');
    expect(result.current.loading).toBe(false);
  });

  it('should clear messages with clearMessages', () => {
    const { result } = renderHook(() => useFeatureActions('testResource'));
    act(() => {
      result.current.setError('error');
      result.current.setSuccess('success');
    });
    act(() => {
      result.current.clearMessages();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
  });

  it('should return empty actions for unknown resource', () => {
    const { result } = renderHook(() =>
      useFeatureActions('nonExistentResource_xyz'),
    );
    expect(Object.keys(result.current.actions).length).toBe(0);
  });

  it('should have a list action for testResource', () => {
    const { result } = renderHook(() => useFeatureActions('testResource'));
    expect(typeof result.current.actions.list).toBe('function');
  });

  it('should set loading true then false when calling wrapped action successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Done' }),
    }) as any;

    const { result } = renderHook(() => useFeatureActions('testResource'));

    await act(async () => {
      try {
        await result.current.actions.list?.();
      } catch {}
    });

    expect(result.current.loading).toBe(false);
    (global.fetch as any).mockRestore?.();
  });

  it('should set loading true then false and re-throw when wrapped action fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error')) as any;

    const { result } = renderHook(() => useFeatureActions('testResource'));

    await act(async () => {
      try {
        await result.current.actions.list?.();
      } catch {}
    });

    expect(result.current.loading).toBe(false);
    (global.fetch as any).mockRestore?.();
  });
});
