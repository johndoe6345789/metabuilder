/**
 * Unit Tests for useSnippetForm Hook
 * Tests form state management for snippet creation/editing
 */

import { renderHook, act } from '@testing-library/react';
import { useSnippetForm } from '@/hooks/useSnippetForm';
import type { Snippet, InputParameter } from '@/lib/types';
import { strings } from '@/lib/config';

describe('useSnippetForm Hook', () => {
  const mockSnippet: Snippet = {
    id: '1',
    title: 'Test Snippet',
    description: 'Test Description',
    language: 'javascript',
    code: 'console.log("test")',
    category: 'general',
    hasPreview: true,
    functionName: 'testFunc',
    inputParameters: [
      { name: 'param1', type: 'string', defaultValue: '', description: 'First param' },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    namespaceId: 'default',
    isTemplate: false,
  };

  describe('initial state', () => {
    it('should initialize with empty form when no snippet provided', () => {
      const { result } = renderHook(() => useSnippetForm());

      expect(result.current.title).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.code).toBe('');
      expect(result.current.language).toBeTruthy();
      expect(result.current.hasPreview).toBe(false);
      expect(result.current.inputParameters).toEqual([]);
      expect(result.current.errors).toEqual({});
    });

    it('should initialize form with snippet data when provided', () => {
      const { result } = renderHook(() => useSnippetForm(mockSnippet));

      expect(result.current.title).toBe(mockSnippet.title);
      expect(result.current.description).toBe(mockSnippet.description);
      expect(result.current.code).toBe(mockSnippet.code);
      expect(result.current.language).toBe(mockSnippet.language);
      expect(result.current.hasPreview).toBe(true);
      expect(result.current.functionName).toBe('testFunc');
      expect(result.current.inputParameters).toHaveLength(1);
    });
  });

  describe('form field setters', () => {
    it('should update title', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('New Title');
      });

      expect(result.current.title).toBe('New Title');
    });

    it('should update description', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setDescription('New Description');
      });

      expect(result.current.description).toBe('New Description');
    });

    it('should update code', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setCode('console.log("new")');
      });

      expect(result.current.code).toBe('console.log("new")');
    });

    it('should update language', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setLanguage('python');
      });

      expect(result.current.language).toBe('python');
    });

    it('should toggle hasPreview', () => {
      const { result } = renderHook(() => useSnippetForm());

      expect(result.current.hasPreview).toBe(false);

      act(() => {
        result.current.setHasPreview(true);
      });

      expect(result.current.hasPreview).toBe(true);
    });

    it('should update functionName', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setFunctionName('myFunction');
      });

      expect(result.current.functionName).toBe('myFunction');
    });
  });

  describe('parameter management', () => {
    it('should add new parameter', () => {
      const { result } = renderHook(() => useSnippetForm());

      expect(result.current.inputParameters).toHaveLength(0);

      act(() => {
        result.current.handleAddParameter();
      });

      expect(result.current.inputParameters).toHaveLength(1);
      expect(result.current.inputParameters[0]).toEqual({
        name: '',
        type: 'string',
        defaultValue: '',
        description: '',
      });
    });

    it('should add multiple parameters', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
        result.current.handleAddParameter();
        result.current.handleAddParameter();
      });

      expect(result.current.inputParameters).toHaveLength(3);
    });

    it('should remove parameter by index', () => {
      const { result } = renderHook(() => useSnippetForm(mockSnippet));

      expect(result.current.inputParameters).toHaveLength(1);

      act(() => {
        result.current.handleRemoveParameter(0);
      });

      expect(result.current.inputParameters).toHaveLength(0);
    });

    it('should remove middle parameter correctly', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
        result.current.handleAddParameter();
        result.current.handleAddParameter();
        result.current.handleRemoveParameter(1);
      });

      expect(result.current.inputParameters).toHaveLength(2);
    });

    it('should update parameter field', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
      });

      act(() => {
        result.current.handleUpdateParameter(0, 'name', 'newParam');
      });

      expect(result.current.inputParameters[0].name).toBe('newParam');
    });

    it('should update parameter type', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
      });

      act(() => {
        result.current.handleUpdateParameter(0, 'type', 'number');
      });

      expect(result.current.inputParameters[0].type).toBe('number');
    });

    it('should update parameter defaultValue', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
      });

      act(() => {
        result.current.handleUpdateParameter(0, 'defaultValue', 'default');
      });

      expect(result.current.inputParameters[0].defaultValue).toBe('default');
    });

    it('should update parameter description', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
      });

      act(() => {
        result.current.handleUpdateParameter(0, 'description', 'Param description');
      });

      expect(result.current.inputParameters[0].description).toBe('Param description');
    });
  });

  describe('validation', () => {
    it('should validate empty title', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('');
        const isValid = result.current.validate();
      });

      expect(result.current.errors.title).toBeTruthy();
    });

    it('should validate empty code', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setCode('');
        const isValid = result.current.validate();
      });

      expect(result.current.errors.code).toBeTruthy();
    });

    it('should validate whitespace-only title', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('   ');
        const isValid = result.current.validate();
      });

      expect(result.current.errors.title).toBeTruthy();
    });

    it('should validate whitespace-only code', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setCode('   ');
        const isValid = result.current.validate();
      });

      expect(result.current.errors.code).toBeTruthy();
    });

    it('should return true for valid form', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('Valid Title');
        result.current.setCode('console.log("code")');
      });

      const isValid = act(() => result.current.validate());
      expect(result.current.errors).toEqual({});
    });

    it('should return false for invalid form', () => {
      const { result } = renderHook(() => useSnippetForm());

      const isValid = act(() => result.current.validate());
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    });

    it('should clear previous errors on revalidation', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('');
        result.current.validate();
      });

      expect(result.current.errors.title).toBeTruthy();

      act(() => {
        result.current.setTitle('Valid Title');
        result.current.validate();
      });

      expect(result.current.errors.title).toBeFalsy();
    });
  });

  describe('getFormData', () => {
    it('should return form data with basic fields', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('My Snippet');
        result.current.setDescription('Description');
        result.current.setCode('console.log("test")');
        result.current.setLanguage('javascript');
      });

      const formData = result.current.getFormData();

      expect(formData.title).toBe('My Snippet');
      expect(formData.description).toBe('Description');
      expect(formData.code).toBe('console.log("test")');
      expect(formData.language).toBe('javascript');
    });

    it('should trim whitespace from fields', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('  Title  ');
        result.current.setDescription('  Desc  ');
        result.current.setCode('  code  ');
      });

      const formData = result.current.getFormData();

      expect(formData.title).toBe('Title');
      expect(formData.description).toBe('Desc');
      expect(formData.code).toBe('code');
    });

    it('should include hasPreview flag', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setHasPreview(true);
        result.current.setTitle('Test');
        result.current.setCode('code');
      });

      const formData = result.current.getFormData();
      expect(formData.hasPreview).toBe(true);
    });

    it('should include functionName if provided', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setFunctionName('  testFunc  ');
        result.current.setTitle('Test');
        result.current.setCode('code');
      });

      const formData = result.current.getFormData();
      expect(formData.functionName).toBe('testFunc');
    });

    it('should exclude functionName if empty', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('Test');
        result.current.setCode('code');
      });

      const formData = result.current.getFormData();
      expect(formData.functionName).toBeUndefined();
    });

    it('should include inputParameters if provided', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('Test');
        result.current.setCode('code');
        result.current.handleAddParameter();
        result.current.handleUpdateParameter(0, 'name', 'param1');
      });

      const formData = result.current.getFormData();
      expect(formData.inputParameters).toBeTruthy();
      expect(formData.inputParameters).toHaveLength(1);
    });

    it('should exclude inputParameters if empty', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('Test');
        result.current.setCode('code');
      });

      const formData = result.current.getFormData();
      expect(formData.inputParameters).toBeUndefined();
    });

    it('should preserve category from editing snippet', () => {
      const { result } = renderHook(() => useSnippetForm({ ...mockSnippet, category: 'utility' }));

      const formData = result.current.getFormData();
      expect(formData.category).toBe('utility');
    });

    it('should default category to general for new snippets', () => {
      const { result } = renderHook(() => useSnippetForm(null));

      act(() => {
        result.current.setTitle('Test');
        result.current.setCode('code');
      });

      const formData = result.current.getFormData();
      expect(formData.category).toBe('general');
    });
  });

  describe('resetForm', () => {
    it('should reset all fields to initial state', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('Title');
        result.current.setDescription('Description');
        result.current.setCode('code');
        result.current.setLanguage('python');
        result.current.setHasPreview(true);
        result.current.setFunctionName('func');
        result.current.handleAddParameter();
      });

      expect(result.current.title).toBe('Title');
      expect(result.current.inputParameters).toHaveLength(1);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.title).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.code).toBe('');
      expect(result.current.hasPreview).toBe(false);
      expect(result.current.functionName).toBe('');
      expect(result.current.inputParameters).toHaveLength(0);
      expect(result.current.errors).toEqual({});
    });

    it('should clear validation errors on reset', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.validate();
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('editing existing snippet', () => {
    it('should populate form with snippet data', () => {
      const { result } = renderHook(() => useSnippetForm(mockSnippet));

      expect(result.current.title).toBe(mockSnippet.title);
      expect(result.current.description).toBe(mockSnippet.description);
      expect(result.current.language).toBe(mockSnippet.language);
      expect(result.current.code).toBe(mockSnippet.code);
      expect(result.current.hasPreview).toBe(mockSnippet.hasPreview);
      expect(result.current.functionName).toBe(mockSnippet.functionName);
    });

    it('should load parameters from snippet', () => {
      const { result } = renderHook(() => useSnippetForm(mockSnippet));

      expect(result.current.inputParameters).toEqual(mockSnippet.inputParameters);
    });

    it('should switch to different snippet', () => {
      const newSnippet: Snippet = {
        ...mockSnippet,
        id: '2',
        title: 'Different Snippet',
      };

      const { result, rerender } = renderHook(
        ({ snippet }) => useSnippetForm(snippet),
        { initialProps: { snippet: mockSnippet } }
      );

      expect(result.current.title).toBe('Test Snippet');

      rerender({ snippet: newSnippet });

      expect(result.current.title).toBe('Different Snippet');
    });

    it('should handle null snippet', () => {
      const { result, rerender } = renderHook(
        ({ snippet }) => useSnippetForm(snippet),
        { initialProps: { snippet: mockSnippet } }
      );

      expect(result.current.title).toBe('Test Snippet');

      rerender({ snippet: null });

      expect(result.current.title).toBe('');
      expect(result.current.code).toBe('');
    });
  });

  describe('dialog open/close', () => {
    it('should reset form when dialog opens', () => {
      const { result } = renderHook(
        ({ open }) => useSnippetForm(null, open),
        { initialProps: { open: false } }
      );

      act(() => {
        result.current.setTitle('Title');
      });

      const { rerender } = result;
      rerender({ open: true });

      expect(result.current.title).toBe('');
    });

    it('should handle open state change', () => {
      const { result } = renderHook(
        ({ open }) => useSnippetForm(mockSnippet, open),
        { initialProps: { open: false } }
      );

      expect(result.current.title).toBe('Test Snippet');
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple parameter updates', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
        result.current.handleAddParameter();
        result.current.handleUpdateParameter(0, 'name', 'param1');
        result.current.handleUpdateParameter(0, 'type', 'string');
        result.current.handleUpdateParameter(1, 'name', 'param2');
        result.current.handleUpdateParameter(1, 'type', 'number');
      });

      expect(result.current.inputParameters).toHaveLength(2);
      expect(result.current.inputParameters[0].name).toBe('param1');
      expect(result.current.inputParameters[1].name).toBe('param2');
    });

    it('should handle form submission workflow', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.setTitle('My Snippet');
        result.current.setCode('code here');
        result.current.setLanguage('javascript');
        result.current.setDescription('Description');
        result.current.setHasPreview(true);
      });

      const isValid = act(() => result.current.validate());
      expect(result.current.errors).toEqual({});

      const formData = result.current.getFormData();
      expect(formData.title).toBe('My Snippet');
      expect(formData.code).toBe('code here');

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.title).toBe('');
    });

    it('should handle rapid parameter additions and removals', () => {
      const { result } = renderHook(() => useSnippetForm());

      act(() => {
        result.current.handleAddParameter();
        result.current.handleAddParameter();
        result.current.handleAddParameter();
        result.current.handleRemoveParameter(1);
        result.current.handleAddParameter();
        result.current.handleRemoveParameter(0);
      });

      expect(result.current.inputParameters).toHaveLength(2);
    });
  });
});
