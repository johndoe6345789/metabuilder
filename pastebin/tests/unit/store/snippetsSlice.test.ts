/**
 * Unit Tests for snippetsSlice Redux Slice
 * Tests snippet state management, async thunks, and reducers
 */

import snippetsReducer, {
  fetchAllSnippets,
  fetchSnippetsByNamespace,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  moveSnippet,
  bulkMoveSnippets,
  toggleSelectionMode,
  toggleSnippetSelection,
  clearSelection,
  selectAllSnippets,
} from '@/store/slices/snippetsSlice';
import * as db from '@/lib/db';
import type { Snippet } from '@/lib/types';

jest.mock('@/lib/db');

describe('snippetsSlice Redux Reducer', () => {
  const mockSnippet: Snippet = {
    id: '1',
    title: 'Test Snippet',
    description: 'Test Description',
    language: 'javascript',
    code: 'console.log("test")',
    category: 'general',
    hasPreview: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    namespaceId: 'default',
    isTemplate: false,
  };

  const initialState = {
    items: [],
    loading: false,
    error: null,
    selectedIds: [],
    selectionMode: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = snippetsReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });
  });

  describe('selection mode reducers', () => {
    describe('toggleSelectionMode', () => {
      it('should toggle selection mode on', () => {
        const state = snippetsReducer(initialState, toggleSelectionMode());
        expect(state.selectionMode).toBe(true);
      });

      it('should toggle selection mode off', () => {
        const stateOn = { ...initialState, selectionMode: true };
        const state = snippetsReducer(stateOn, toggleSelectionMode());
        expect(state.selectionMode).toBe(false);
      });

      it('should clear selected ids when turning off selection mode', () => {
        const stateOn = { ...initialState, selectionMode: true, selectedIds: ['1', '2'] };
        const state = snippetsReducer(stateOn, toggleSelectionMode());
        expect(state.selectionMode).toBe(false);
        expect(state.selectedIds).toEqual([]);
      });
    });

    describe('toggleSnippetSelection', () => {
      it('should add snippet to selection', () => {
        const state = snippetsReducer(initialState, toggleSnippetSelection('1'));
        expect(state.selectedIds).toContain('1');
      });

      it('should remove snippet from selection', () => {
        const stateWithSelection = { ...initialState, selectedIds: ['1', '2'] };
        const state = snippetsReducer(stateWithSelection, toggleSnippetSelection('1'));
        expect(state.selectedIds).not.toContain('1');
        expect(state.selectedIds).toContain('2');
      });

      it('should handle multiple toggles', () => {
        let state = initialState;
        state = snippetsReducer(state, toggleSnippetSelection('1'));
        state = snippetsReducer(state, toggleSnippetSelection('2'));
        state = snippetsReducer(state, toggleSnippetSelection('3'));

        expect(state.selectedIds).toEqual(['1', '2', '3']);
      });

      it('should preserve other selections when toggling', () => {
        const stateWithSelection = { ...initialState, selectedIds: ['1', '2', '3'] };
        const state = snippetsReducer(stateWithSelection, toggleSnippetSelection('2'));
        expect(state.selectedIds).toEqual(['1', '3']);
      });
    });

    describe('clearSelection', () => {
      it('should clear all selected ids', () => {
        const stateWithSelection = { ...initialState, selectedIds: ['1', '2', '3'] };
        const state = snippetsReducer(stateWithSelection, clearSelection());
        expect(state.selectedIds).toEqual([]);
      });

      it('should not affect selection mode', () => {
        const stateWithSelection = { ...initialState, selectionMode: true, selectedIds: ['1'] };
        const state = snippetsReducer(stateWithSelection, clearSelection());
        expect(state.selectionMode).toBe(true);
        expect(state.selectedIds).toEqual([]);
      });
    });

    describe('selectAllSnippets', () => {
      it('should select all snippet ids', () => {
        const stateWithSnippets = {
          ...initialState,
          items: [
            { ...mockSnippet, id: '1' },
            { ...mockSnippet, id: '2' },
            { ...mockSnippet, id: '3' },
          ],
        };
        const state = snippetsReducer(stateWithSnippets, selectAllSnippets());
        expect(state.selectedIds).toEqual(['1', '2', '3']);
      });

      it('should handle empty items', () => {
        const state = snippetsReducer(initialState, selectAllSnippets());
        expect(state.selectedIds).toEqual([]);
      });
    });
  });

  describe('async thunks - fetchAllSnippets', () => {
    it('should handle fetchAllSnippets.pending', () => {
      const action = { type: fetchAllSnippets.pending.type };
      const state = snippetsReducer(initialState, action as any);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchAllSnippets.fulfilled', () => {
      const snippets = [mockSnippet];
      const action = { type: fetchAllSnippets.fulfilled.type, payload: snippets };
      const state = snippetsReducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.items).toEqual(snippets);
    });

    it('should handle fetchAllSnippets.rejected', () => {
      const action = {
        type: fetchAllSnippets.rejected.type,
        error: { message: 'Failed to fetch snippets' },
      };
      const state = snippetsReducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('async thunks - fetchSnippetsByNamespace', () => {
    it('should handle fetchSnippetsByNamespace.pending', () => {
      const action = { type: fetchSnippetsByNamespace.pending.type };
      const state = snippetsReducer(initialState, action as any);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchSnippetsByNamespace.fulfilled', () => {
      const snippets = [mockSnippet];
      const action = {
        type: fetchSnippetsByNamespace.fulfilled.type,
        payload: snippets,
      };
      const state = snippetsReducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.items).toEqual(snippets);
    });

    it('should handle fetchSnippetsByNamespace.rejected', () => {
      const action = {
        type: fetchSnippetsByNamespace.rejected.type,
        error: { message: 'Failed to fetch snippets' },
      };
      const state = snippetsReducer(initialState, action as any);

      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('async thunks - createSnippet', () => {
    it('should add new snippet to items', () => {
      const newSnippet = { ...mockSnippet, id: 'new-id' };
      const action = { type: createSnippet.fulfilled.type, payload: newSnippet };
      const state = snippetsReducer(initialState, action as any);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(newSnippet);
    });

    it('should add new snippet at beginning', () => {
      const existing = { ...mockSnippet, id: '1' };
      const stateWithItems = { ...initialState, items: [existing] };
      const newSnippet = { ...mockSnippet, id: '2' };
      const action = { type: createSnippet.fulfilled.type, payload: newSnippet };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items[0].id).toBe('2');
      expect(state.items[1].id).toBe('1');
    });
  });

  describe('async thunks - updateSnippet', () => {
    it('should update existing snippet', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockSnippet],
      };

      const updatedSnippet = {
        ...mockSnippet,
        title: 'Updated Title',
        updatedAt: Date.now() + 1000,
      };

      const action = { type: updateSnippet.fulfilled.type, payload: updatedSnippet };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items[0].title).toBe('Updated Title');
    });

    it('should not add snippet if not found', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockSnippet],
      };

      const newSnippet = { ...mockSnippet, id: 'nonexistent', title: 'New' };
      const action = { type: updateSnippet.fulfilled.type, payload: newSnippet };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('1');
    });
  });

  describe('async thunks - deleteSnippet', () => {
    it('should remove snippet from items', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockSnippet, { ...mockSnippet, id: '2' }],
      };

      const action = { type: deleteSnippet.fulfilled.type, payload: '1' };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('2');
    });

    it('should handle deleting non-existent snippet', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockSnippet],
      };

      const action = { type: deleteSnippet.fulfilled.type, payload: 'nonexistent' };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items).toHaveLength(1);
    });
  });

  describe('async thunks - moveSnippet', () => {
    it('should remove moved snippet from items', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockSnippet, { ...mockSnippet, id: '2' }],
      };

      const action = {
        type: moveSnippet.fulfilled.type,
        payload: { snippetId: '1', targetNamespaceId: 'new-ns' },
      };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('2');
    });
  });

  describe('async thunks - bulkMoveSnippets', () => {
    it('should remove moved snippets from items', () => {
      const stateWithItems = {
        ...initialState,
        items: [
          { ...mockSnippet, id: '1' },
          { ...mockSnippet, id: '2' },
          { ...mockSnippet, id: '3' },
        ],
        selectedIds: ['1', '2'],
        selectionMode: true,
      };

      const action = {
        type: bulkMoveSnippets.fulfilled.type,
        payload: { snippetIds: ['1', '2'], targetNamespaceId: 'new-ns' },
      };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('3');
      expect(state.selectedIds).toEqual([]);
      expect(state.selectionMode).toBe(false);
    });

    it('should clear selection after bulk move', () => {
      const stateWithSelection = {
        ...initialState,
        items: [{ ...mockSnippet, id: '1' }],
        selectedIds: ['1'],
        selectionMode: true,
      };

      const action = {
        type: bulkMoveSnippets.fulfilled.type,
        payload: { snippetIds: ['1'], targetNamespaceId: 'new-ns' },
      };
      const state = snippetsReducer(stateWithSelection, action as any);

      expect(state.selectedIds).toEqual([]);
      expect(state.selectionMode).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('should handle full workflow: fetch, create, update, delete', () => {
      let state = initialState;

      // Fetch snippets
      const fetchAction = { type: fetchAllSnippets.fulfilled.type, payload: [mockSnippet] };
      state = snippetsReducer(state, fetchAction as any);
      expect(state.items).toHaveLength(1);

      // Create snippet
      const newSnippet = { ...mockSnippet, id: '2', title: 'New' };
      const createAction = { type: createSnippet.fulfilled.type, payload: newSnippet };
      state = snippetsReducer(state, createAction as any);
      expect(state.items).toHaveLength(2);
      expect(state.items[0].id).toBe('2');

      // Update snippet
      const updatedSnippet = { ...newSnippet, title: 'Updated' };
      const updateAction = { type: updateSnippet.fulfilled.type, payload: updatedSnippet };
      state = snippetsReducer(state, updateAction as any);
      expect(state.items[0].title).toBe('Updated');

      // Delete snippet
      const deleteAction = { type: deleteSnippet.fulfilled.type, payload: '2' };
      state = snippetsReducer(state, deleteAction as any);
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('1');
    });

    it('should handle selection with multiple operations', () => {
      let state = {
        ...initialState,
        items: [
          { ...mockSnippet, id: '1' },
          { ...mockSnippet, id: '2' },
          { ...mockSnippet, id: '3' },
        ],
      };

      // Toggle selection mode
      state = snippetsReducer(state, toggleSelectionMode());
      expect(state.selectionMode).toBe(true);

      // Select multiple
      state = snippetsReducer(state, toggleSnippetSelection('1'));
      state = snippetsReducer(state, toggleSnippetSelection('2'));
      expect(state.selectedIds).toEqual(['1', '2']);

      // Select all
      state = snippetsReducer(state, selectAllSnippets());
      expect(state.selectedIds).toEqual(['1', '2', '3']);

      // Clear
      state = snippetsReducer(state, clearSelection());
      expect(state.selectedIds).toEqual([]);

      // Delete one
      state = snippetsReducer(state, { type: deleteSnippet.fulfilled.type, payload: '1' } as any);
      expect(state.items).toHaveLength(2);
    });

    it('should maintain selection mode through operations', () => {
      let state = initialState;

      state = snippetsReducer(state, toggleSelectionMode());
      expect(state.selectionMode).toBe(true);

      state = snippetsReducer(state, toggleSnippetSelection('1'));
      expect(state.selectionMode).toBe(true);

      state = snippetsReducer(state, clearSelection());
      expect(state.selectionMode).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should preserve items on error', () => {
      const stateWithItems = { ...initialState, items: [mockSnippet] };

      const action = {
        type: fetchAllSnippets.rejected.type,
        error: { message: 'Error' },
      };
      const state = snippetsReducer(stateWithItems, action as any);

      expect(state.items).toEqual([mockSnippet]);
      expect(state.error).toBeTruthy();
    });

    it('should clear error on successful fetch', () => {
      const stateWithError = {
        ...initialState,
        error: 'Previous error',
        items: [mockSnippet],
      };

      const action = { type: fetchAllSnippets.pending.type };
      const state = snippetsReducer(stateWithError, action as any);

      expect(state.error).toBeNull();
    });
  });
});
