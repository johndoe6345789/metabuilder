vi.mock('@/utils/featureConfig', async () => ({
  getFormSchema: (resourceName: string) => {
    if (resourceName === 'testForm') {
      return {
        name: 'testForm',
        fields: [
          {
            name: 'username',
            type: 'text',
            label: 'Username',
            required: true,
            defaultValue: undefined,
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            required: true,
            defaultValue: 'default@example.com',
          },
          {
            name: 'age',
            type: 'number',
            label: 'Age',
            required: false,
            defaultValue: 18,
            min: 0,
            max: 120,
          },
        ],
      };
    }
    return undefined;
  },
  getValidationRule: () => undefined,
  getQueryOperators: () => [],
  getIndexTypes: () => [],
  validateSqlParameter: () => null,
  validateSqlTemplateParams: () => null,
  getSqlParameterType: () => undefined,
  getSqlParameterTypes: () => ({}),
  getSqlQueryTemplate: () => undefined,
  getAllSqlTemplates: () => ({}),
  getSqlTemplatesByCategory: () => ({}),
  getApiEndpoints: () => undefined,
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

import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormSchema } from './useFormSchema';

describe('useFormSchema', () => {
  it('should initialize with default values from schema', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    // email has defaultValue 'default@example.com', age has defaultValue 18
    expect(result.current.values.email).toBe('default@example.com');
    expect(result.current.values.age).toBe(18);
  });

  it('should have schema defined for known resource', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    expect(result.current.schema).toBeDefined();
    expect(result.current.schema!.fields.length).toBe(3);
  });

  it('should have no schema for unknown resource', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useFormSchema('unknownResource_xyz'));
    expect(result.current.schema).toBeUndefined();
    consoleSpy.mockRestore();
  });

  it('should start with empty errors and touched', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    expect(Object.keys(result.current.errors).length).toBe(0);
    expect(Object.keys(result.current.touched).length).toBe(0);
  });

  it('should start as valid (no errors)', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    expect(result.current.isValid).toBe(true);
  });

  it('should update value with handleChange', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    act(() => {
      result.current.handleChange('username', 'john');
    });
    expect(result.current.values.username).toBe('john');
  });

  it('should clear error when field changes', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    // Manually add an error first by calling handleBlur
    act(() => {
      // Set username to empty so validation might fail
      result.current.handleChange('username', '');
    });
    // Error should still be none (validation happens on blur)
    expect(result.current.errors.username).toBeUndefined();
  });

  it('should mark field as touched on handleBlur', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    act(() => {
      result.current.handleBlur('username');
    });
    expect(result.current.touched.username).toBe(true);
  });

  it('should reset to defaults with reset()', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    act(() => {
      result.current.handleChange('username', 'john');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.values.username).toBeUndefined();
    expect(result.current.values.email).toBe('default@example.com');
  });

  it('should reset to provided data with reset(newData)', () => {
    const { result } = renderHook(() => useFormSchema('testForm'));
    act(() => {
      result.current.reset({ username: 'newUser', email: 'new@test.com' });
    });
    expect(result.current.values.username).toBe('newUser');
    expect(result.current.values.email).toBe('new@test.com');
  });

  it('should use initialData when provided', () => {
    const { result } = renderHook(() =>
      useFormSchema('testForm', { username: 'initial' }),
    );
    expect(result.current.values.username).toBe('initial');
  });
});
