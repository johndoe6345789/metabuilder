/**
 * Unit Tests for useSnippetManager Hook
 * Tests comprehensive snippet management with Redux integration
 */

import { renderHook, act } from '@testing-library/react';
import { useSnippetManager } from '@/hooks/useSnippetManager';
import type { SnippetTemplate } from '@/lib/types';
import * as db from '@/lib/db';

jest.mock('@metabuilder/components/fakemui', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));
jest.mock('@/lib/db');

// Mock useTranslation to return English strings directly
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    toast: {
      failedToLoadData: 'Failed to load data',
      snippetDeleted: 'Snippet deleted',
      failedToDeleteSnippet: 'Failed to delete snippet',
      codeCopied: 'Code copied to clipboard',
      noSnippetsSelected: 'No snippets selected',
      failedToMoveSnippets: 'Failed to move snippets',
      movedSnippets: 'Moved {count} snippet(s) to {namespace}',
    },
  }),
}));

// Mock next/navigation router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

// We need to mock the Redux hooks properly
import * as reduxHooks from '@/store/hooks';

// Get the mocked toast for assertions
import { toast } from '@metabuilder/components/fakemui';

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
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      expect(result.current.snippets).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.selectionMode).toBeDefined();
    });

    it('should seed database and sync templates on mount', async () => {
      const mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

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
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

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
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockImplementation(() => []);
    });

    it('should handle edit snippet navigation', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      const snippet = {
        id: 'snippet-1',
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

      // handleEditSnippet navigates to the snippet view page
      expect(mockPush).toHaveBeenCalledWith('/snippet/snippet-1');
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
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        writable: true,
      });

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

      // handleViewSnippet navigates to the snippet page
      expect(mockPush).toHaveBeenCalledWith('/snippet/1');
    });
  });

  describe('selection operations', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    });

    it('should toggle selection mode', () => {
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleToggleSelectionMode();
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should toggle snippet selection', () => {
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleToggleSnippetSelection('1');
      });

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should select all snippets', () => {
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockImplementation((selector) => {
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

      (reduxHooks.useAppSelector as unknown as jest.Mock).mockImplementation((selector) => {
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
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    });

    it('should handle bulk move with selected snippets', async () => {
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockImplementation((selector) => {
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
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

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

      (reduxHooks.useAppSelector as unknown as jest.Mock).mockImplementation((selector) => {
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

  describe('navigation operations', () => {
    let mockDispatch: jest.Mock;

    beforeEach(() => {
      mockDispatch = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);
    });

    it('should navigate to new snippet page', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleCreateNew();
      });

      expect(mockPush).toHaveBeenCalledWith('/snippet/new');
    });

    it('should navigate to template snippet page', () => {
      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      act(() => {
        result.current.handleCreateFromTemplate('template-1');
      });

      expect(mockPush).toHaveBeenCalledWith('/snippet/new?template=template-1');
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
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);
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

      // Clear calls from initialization effects before testing the handler
      mockDispatch.mockClear();

      act(() => {
        result.current.handleNamespaceChange(null);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('returned state and handlers', () => {
    it('should return all required state properties', () => {
      const mockDispatch = jest.fn();
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

      expect(result.current.snippets).toBeDefined();
      expect(result.current.filteredSnippets).toBeDefined();
      expect(result.current.loading).toBeDefined();
      expect(result.current.selectionMode).toBeDefined();
      expect(result.current.selectedIds).toBeDefined();
      expect(result.current.namespaces).toBeDefined();
      expect(result.current.selectedNamespaceId).toBeDefined();
      expect(result.current.viewerOpen).toBeDefined();
      expect(result.current.viewingSnippet).toBeDefined();
      expect(result.current.searchQuery).toBeDefined();
    });

    it('should return all required handler functions', () => {
      const mockDispatch = jest.fn();
      (reduxHooks.useAppDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
      (reduxHooks.useAppSelector as unknown as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useSnippetManager(mockTemplates));

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
