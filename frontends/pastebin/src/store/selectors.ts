import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './index'

export const selectSnippets = (state: RootState) => state.snippets.items
export const selectSnippetsLoading = (state: RootState) => state.snippets.loading
export const selectSnippetsError = (state: RootState) => state.snippets.error
export const selectSelectionMode = (state: RootState) => state.snippets.selectionMode
export const selectSelectedIds = (state: RootState) => state.snippets.selectedIds

export const selectNamespaces = (state: RootState) => state.namespaces.items
export const selectSelectedNamespaceId = (state: RootState) => state.namespaces.selectedId
export const selectNamespacesLoading = (state: RootState) => state.namespaces.loading
export const selectNamespacesError = (state: RootState) => state.namespaces.error

export const selectSearchQuery = (state: RootState) => state.ui.searchQuery
export const selectViewerOpen = (state: RootState) => state.ui.viewerOpen
export const selectViewingSnippet = (state: RootState) => state.ui.viewingSnippet
export const selectTheme = (state: RootState) => state.ui.theme ?? 'light'

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

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.loading
export const selectAuthError = (state: RootState) => state.auth.error

export const selectSnippetComments = (state: RootState, snippetId: string) =>
  state.comments.snippetComments[snippetId] ?? []
export const selectProfileComments = (state: RootState, profileUserId: string) =>
  state.comments.profileComments[profileUserId] ?? []
export const selectCommentsLoading = (state: RootState) => state.comments.loading

export const selectRevisions = (state: RootState, snippetId: string) =>
  state.revisions.bySnippetId[snippetId] ?? []
export const selectRevisionsLoading = (state: RootState) => state.revisions.loading

export const selectSharedSnippet = (state: RootState, token: string) =>
  state.share.sharedSnippets[token] ?? null
export const selectShareLoading = (state: RootState) => state.share.loading

export const selectUserProfile = (state: RootState, username: string) =>
  state.profiles.byUsername[username] ?? null
export const selectProfilesLoading = (state: RootState) => state.profiles.loading
