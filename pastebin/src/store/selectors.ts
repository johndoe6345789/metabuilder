import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './index'

export const selectSnippets = (state: RootState) => state.snippets.items
export const selectSnippetsLoading = (state: RootState) => state.snippets.loading
export const selectSelectionMode = (state: RootState) => state.snippets.selectionMode
export const selectSelectedIds = (state: RootState) => state.snippets.selectedIds

export const selectNamespaces = (state: RootState) => state.namespaces.items
export const selectSelectedNamespaceId = (state: RootState) => state.namespaces.selectedId
export const selectNamespacesLoading = (state: RootState) => state.namespaces.loading

export const selectSearchQuery = (state: RootState) => state.ui.searchQuery
export const selectDialogOpen = (state: RootState) => state.ui.dialogOpen
export const selectViewerOpen = (state: RootState) => state.ui.viewerOpen
export const selectEditingSnippet = (state: RootState) => state.ui.editingSnippet
export const selectViewingSnippet = (state: RootState) => state.ui.viewingSnippet

export const selectSelectedNamespace = createSelector(
  [selectNamespaces, selectSelectedNamespaceId],
  (namespaces, selectedId) => namespaces.find(n => n.id === selectedId)
)

export const selectFilteredSnippets = createSelector(
  [selectSnippets, selectSearchQuery],
  (snippets, query) => {
    if (!query.trim()) return snippets

    const lowerQuery = query.toLowerCase()
    return snippets.filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(lowerQuery) ||
        snippet.description.toLowerCase().includes(lowerQuery) ||
        snippet.language.toLowerCase().includes(lowerQuery) ||
        snippet.code.toLowerCase().includes(lowerQuery)
    )
  }
)

export const selectSelectedSnippets = createSelector(
  [selectSnippets, selectSelectedIds],
  (snippets, selectedIds) => snippets.filter(s => selectedIds.includes(s.id))
)
