/**
 * Unit Tests for useSnippetManager Hook
 * Tests comprehensive snippet management with Redux integration
 */

import { renderHook, act } from '@testing-library/react';
import { useSnippetManager } from '@/hooks/useSnippetManager';
import { toast } from 'sonner';
import type { SnippetTemplate } from '@/lib/types';
import * as db from '@/lib/db';

jest.mock('sonner');
jest.mock('@/lib/db');
jest.mock('react-redux', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
}));

// We need to mock the Redux hooks properly
import * as reduxHooks from 'react-redux';

describe('useSnippetManager Hook', () => {
  const mockTemplates: SnippetTemplate[] = [
    {
      id: 'template-1',
      title: 'Template 1',
      description: 'Test Template',
      language: 'javascript',
      code: 'console.log("template")',
      category: 'general',
      hasPreview: false,
      isTemplate: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (db.seedDatabase as jest.Mock).mockResolvedValue(undefined);
    (db.syncTemplatesFromJSON as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const mockDispatch = jest.fn();
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      expect(result.current.snippets).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.selectionMode).toBeDefined();
    });

    it('should seed database and sync templates on mount', async () => {
      const mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      await act(async () => {
        renderHook(() => useSnippetManager(mockTemplates));
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(db.seedDatabase).toHaveBeenCalled();
      expect(db.syncTemplatesFromJSON).toHaveBeenCalledWith(mockTemplates);
    });

    it('should handle initialization error', async () => {
      (db.seedDatabase as jest.Mock).mockRejectedValue(new Error('Seed failed'));

      const mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      await act(async () => {
        renderHook(() => useSnippetManager(mockTemplates));
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to load data');
    });
  });

  describe('snippet operations', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn();
      mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockImplementation((selector) => {
        // Return appropriate mock data based on selector
        return [];
      });
    });

    it('should handle save snippet for new snippet', async () => {
      mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      const snippetData = {
        title: 'New Snippet',
        description: 'Description',
        language: 'javascript',
        code: 'console.log("new")',
        category: 'general' as const,
        hasPreview: false,
      };

      await act(async () => {
        await result.current.handleSaveSnippet(snippetData);
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle save snippet for editing', async () => {
      mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });

      // Mock selector to return an editing snippet
      (reduxHooks.useAppSelector as jest.Mock).mockImplementation((selector) => {
        if (selector.toString().includes('editingSnippet')) {
          return { id: '1', title: 'Existing' };
        }
        return [];
      });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      const snippetData = {
        title: 'Updated Snippet',
        description: 'Updated Description',
        language: 'javascript',
        code: 'console.log("updated")',
        category: 'general' as const,
        hasPreview: false,
      };

      await act(async () => {
        await result.current.handleSaveSnippet(snippetData);
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle save snippet error', async () => {
      mockDispatch.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Save failed')),
      });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      const snippetData = {
        title: 'New Snippet',
        description: 'Description',
        language: 'javascript',
        code: 'console.log("new")',
        category: 'general' as const,
        hasPreview: false,
      };

      await act(async () => {
        await result.current.handleSaveSnippet(snippetData);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to save snippet');
    });

    it('should handle edit snippet', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      const snippet = {
        id: '1',
        title: 'Test',
        description: '',
        language: 'javascript' as const,
        code: '',
        category: 'general' as const,
        hasPreview: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        namespaceId: 'default',
        isTemplate: false,
      };

      act(() => {
        result.current.handleEditSnippet(snippet);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle delete snippet', async () => {
      mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      await act(async () => {
        await result.current.handleDeleteSnippet('1');
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle delete snippet error', async () => {
      mockDispatch.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Delete failed')),
      });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      await act(async () => {
        await result.current.handleDeleteSnippet('1');
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to delete snippet');
    });

    it('should handle copy code', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleCopyCode('console.log("test")');
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle view snippet', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      const snippet = {
        id: '1',
        title: 'Test',
        description: '',
        language: 'javascript' as const,
        code: '',
        category: 'general' as const,
        hasPreview: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        namespaceId: 'default',
        isTemplate: false,
      };

      act(() => {
        result.current.handleViewSnippet(snippet);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('selection operations', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    });

    it('should toggle selection mode', () => {
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleToggleSelectionMode();
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should toggle snippet selection', () => {
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleToggleSnippetSelection('1');
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should select all snippets', () => {
      (reduxHooks.useAppSelector as jest.Mock).mockImplementation((selector) => {
        if (selector.toString().includes('selectedIds')) {
          return [];
        }
        if (selector.toString().includes('filteredSnippets')) {
          return [{ id: '1' }, { id: '2' }];
        }
        return [];
      });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleSelectAll();
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should deselect all when all selected', () => {
      const selectedIds = ['1', '2'];
      const filteredSnippets = [{ id: '1' }, { id: '2' }];

      (reduxHooks.useAppSelector as jest.Mock).mockImplementation((selector) => {
        if (selector.toString().includes('selectedIds')) {
          return selectedIds;
        }
        if (selector.toString().includes('filteredSnippets')) {
          return filteredSnippets;
        }
        return [];
      });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleSelectAll();
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('bulk operations', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    });

    it('should handle bulk move with selected snippets', async () => {
      (reduxHooks.useAppSelector as jest.Mock).mockImplementation((selector) => {
        if (selector.toString().includes('selectedIds')) {
          return ['1', '2'];
        }
        if (selector.toString().includes('namespaces')) {
          return [{ id: 'target', name: 'Target Namespace' }];
        }
        if (selector.toString().includes('selectedNamespaceId')) {
          return 'current';
        }
        return [];
      });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      await act(async () => {
        await result.current.handleBulkMove('target');
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should reject bulk move with no selection', async () => {
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      await act(async () => {
        await result.current.handleBulkMove('target');
      });

      expect(toast.error).toHaveBeenCalledWith('No snippets selected');
    });

    it('should handle bulk move error', async () => {
      mockDispatch.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error('Move failed')),
      });

      (reduxHooks.useAppSelector as jest.Mock).mockImplementation((selector) => {
        if (selector.toString().includes('selectedIds')) {
          return ['1'];
        }
        return [];
      });

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      await act(async () => {
        await result.current.handleBulkMove('target');
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to move snippets');
    });
  });

  describe('template operations', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);
    });

    it('should create new snippet from template', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleCreateFromTemplate('template-1');
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle invalid template id', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleCreateFromTemplate('invalid-id');
      });

      // Should not dispatch for invalid template
      expect(mockDispatch).not.toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('dialog operations', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn();
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);
    });

    it('should create new snippet', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleCreateNew();
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should close dialog', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleDialogClose(false);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should close viewer', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleViewerClose(false);
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('search and filtering', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn();
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);
    });

    it('should handle search change', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleSearchChange('test query');
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle namespace change', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleNamespaceChange('namespace-1');
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle null namespace', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleNamespaceChange(null);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('returned state and handlers', () => {
    it('should return all required state properties', () => {
      const mockDispatch = jest.fn();
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      expect(result.current.snippets).toBeDefined();
      expect(result.current.filteredSnippets).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.selectionMode).toBeDefined();
      expect(result.current.selectedIds).toBeDefined();
      expect(result.current.namespaces).toBeDefined();
      expect(result.current.selectedNamespaceId).toBeDefined();
      expect(result.current.dialogOpen).toBeDefined();
      expect(result.current.viewerOpen).toBeDefined();
      expect(result.current.editingSnippet).toBeDefined();
      expect(result.current.viewingSnippet).toBeDefined();
      expect(result.current.searchQuery).toBeDefined();
    });

    it('should return all required handler functions', () => {
      const mockDispatch = jest.fn();
      (reduxHooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      expect(typeof result.current.handleSaveSnippet).toBe('function');
      expect(typeof result.current.handleEditSnippet).toBe('function');
      expect(typeof result.current.handleDeleteSnippet).toBe('function');
      expect(typeof result.current.handleCopyCode).toBe('function');
      expect(typeof result.current.handleViewSnippet).toBe('function');
      expect(typeof result.current.handleCreateNew).toBe('function');
      expect(typeof result.current.handleCreateFromTemplate).toBe('function');
      expect(typeof result.current.handleToggleSelectionMode).toBe('function');
      expect(typeof result.current.handleSelectAll).toBe('function');
      expect(typeof result.current.handleBulkMove).toBe('function');
    });
  });
});
