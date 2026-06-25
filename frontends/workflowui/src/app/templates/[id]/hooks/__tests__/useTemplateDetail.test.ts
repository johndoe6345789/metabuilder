/**
 * Tests for useTemplateDetail hook
 */

const mockGetTemplate = jest.fn();
const mockGetRelatedTemplates = jest.fn();

jest.mock('@metabuilder/services', () => ({
  templateService: {
    getTemplate: (...args: any[]) => mockGetTemplate(...args),
    getRelatedTemplates: (...args: any[]) => mockGetRelatedTemplates(...args),
  },
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'tpl-123' }),
}));

import { renderHook, act } from '@testing-library/react';
import { useTemplateDetail } from '../useTemplateDetail';

const makeTemplate = (overrides = {}) => ({
  id: 'tpl-123',
  name: 'My Template',
  description: 'A template',
  ...overrides,
});

describe('useTemplateDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTemplate.mockReturnValue(makeTemplate());
    mockGetRelatedTemplates.mockReturnValue([]);
  });

  it('returns template from templateService', () => {
    const { result } = renderHook(() => useTemplateDetail());
    expect(result.current.template).toEqual(expect.objectContaining({ id: 'tpl-123' }));
    expect(mockGetTemplate).toHaveBeenCalledWith('tpl-123');
  });

  it('returns relatedTemplates from templateService', () => {
    const related = [makeTemplate({ id: 'r1', name: 'Related' })];
    mockGetRelatedTemplates.mockReturnValue(related);
    const { result } = renderHook(() => useTemplateDetail());
    expect(result.current.relatedTemplates).toEqual(related);
  });

  it('showCreateForm defaults to false', () => {
    const { result } = renderHook(() => useTemplateDetail());
    expect(result.current.showCreateForm).toBe(false);
  });

  it('setShowCreateForm toggles showCreateForm', () => {
    const { result } = renderHook(() => useTemplateDetail());
    act(() => {
      result.current.setShowCreateForm(true);
    });
    expect(result.current.showCreateForm).toBe(true);
  });

  it('projectName defaults to template name', () => {
    const { result } = renderHook(() => useTemplateDetail());
    expect(result.current.projectName).toBe('My Template');
  });

  it('setProjectName updates projectName', () => {
    const { result } = renderHook(() => useTemplateDetail());
    act(() => {
      result.current.setProjectName('New Project');
    });
    expect(result.current.projectName).toBe('New Project');
  });

  it('workspace defaults to empty string', () => {
    const { result } = renderHook(() => useTemplateDetail());
    expect(result.current.workspace).toBe('');
  });

  it('setWorkspace updates workspace', () => {
    const { result } = renderHook(() => useTemplateDetail());
    act(() => {
      result.current.setWorkspace('my-workspace');
    });
    expect(result.current.workspace).toBe('my-workspace');
  });

  it('customizeWorkflows defaults to true', () => {
    const { result } = renderHook(() => useTemplateDetail());
    expect(result.current.customizeWorkflows).toBe(true);
  });

  it('setCustomizeWorkflows updates the value', () => {
    const { result } = renderHook(() => useTemplateDetail());
    act(() => {
      result.current.setCustomizeWorkflows(false);
    });
    expect(result.current.customizeWorkflows).toBe(false);
  });

  it('handleCreateProject closes form without throwing', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHook(() => useTemplateDetail());
    act(() => {
      result.current.setShowCreateForm(true);
    });
    act(() => {
      result.current.handleCreateProject({ preventDefault: jest.fn() } as any);
    });
    expect(result.current.showCreateForm).toBe(false);
    consoleSpy.mockRestore();
  });

  it('handles null template (template not found)', () => {
    mockGetTemplate.mockReturnValue(null);
    const { result } = renderHook(() => useTemplateDetail());
    expect(result.current.template).toBeNull();
    expect(result.current.projectName).toBe('');
  });
});
