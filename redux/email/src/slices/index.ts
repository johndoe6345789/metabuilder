/**
 * Email Redux Slices - Barrel Export
 * Exports all email slices, actions, and selectors
 */

// Email List Slice
export {
  emailListSlice,
  fetchMessages,
  setSelectedMessage,
  setFilter,
  setSearchQuery,
  clearSearchQuery,
  setCurrentPage,
  setPageSize,
  toggleMessageRead,
  toggleMessageStarred,
  removeMessage,
  clearMessages,
  selectMessages,
  selectSelectedMessageId,
  selectFilter,
  selectSearchQuery,
  selectPagination,
  selectIsLoading,
  selectError,
  selectSelectedMessage
} from './emailListSlice'
export type { EmailListState, EmailMessage, PaginationState } from './emailListSlice'

// Email Detail Slice
export {
  emailDetailSlice,
  fetchEmailDetail,
  fetchConversationThread,
  setSelectedEmail,
  addToThread,
  clearThread,
  setEmailRead,
  setEmailStarred,
  clearEmailDetail,
  selectSelectedEmail,
  selectThreadMessages,
  selectConversationThread
} from './emailDetailSlice'
export type { EmailDetailState, EmailDetail, ThreadMessage } from './emailDetailSlice'

// Email Compose Slice
export {
  emailComposeSlice,
  saveDraftAsync,
  sendEmailAsync,
  fetchDrafts,
  createDraft,
  updateDraft,
  updateDraftMultiple,
  addRecipient,
  removeRecipient,
  addAttachment,
  removeAttachment,
  setCurrentDraft,
  clearDraft,
  deleteDraft,
  selectCurrentDraft,
  selectDrafts,
  selectDraftCount,
  selectSuccessMessage
} from './emailComposeSlice'
export type { ComposeDraftState, EmailDraft } from './emailComposeSlice'

// Email Filters Slice
export {
  emailFiltersSlice,
  addFilter,
  updateFilter,
  removeFilter,
  clearAllFilters,
  setActiveFilter,
  addSearchQuery,
  removeSearchQuery,
  clearSearchHistory,
  resetFilters,
  selectSavedFilters,
  selectFilterById,
  selectActiveFilterId,
  selectActiveFilter,
  selectRecentSearches,
  selectTopSearches,
  selectFilterCount,
  selectSearchHistoryCount
} from './emailFiltersSlice'
export type { EmailFilterState, EmailFilter, SearchQuery } from './emailFiltersSlice'
