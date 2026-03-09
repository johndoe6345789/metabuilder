/**
 * useDocumentation Hook
 * Custom hook for documentation system integration
 *
 * Migrated from workflowui - requires Redux store with documentationSlice
 */

import { useCallback, useMemo } from 'react';

/** Documentation category types */
export type DocCategory = 'getting-started' | 'tutorials' | 'reference' | 'api' | 'guides' | string;

/** Documentation page interface */
export interface DocPage {
  id: string;
  title: string;
  category: DocCategory;
  content: string;
  tags?: string[];
  relatedPages?: string[];
}

/** Documentation navigation tree node */
export interface DocNavNode {
  id: string;
  title: string;
  children?: DocNavNode[];
}

/** Documentation service interface */
export interface DocumentationService {
  getPage: (id: string) => DocPage | null;
  getNavigationTree: () => DocNavNode[];
  getPagesByCategory: (category: DocCategory) => DocPage[];
  search: (query: string) => DocPage[];
  getRelatedPages: (pageId: string) => DocPage[];
  getBreadcrumbs: (pageId: string) => { id: string; title: string }[];
  getStats: () => { totalPages: number; categories: number };
}

/** Redux state interface for documentation */
export interface DocumentationState {
  isOpen: boolean;
  currentPageId: string | null;
  currentCategory: DocCategory | null;
  searchQuery: string;
  searchResults: string[];
  history: string[];
}

/** Redux actions interface */
export interface DocumentationActions {
  openHelp: (payload: { pageId?: string; category?: DocCategory }) => any;
  closeHelp: () => any;
  navigateToPage: (pageId: string) => any;
  setCategory: (category: DocCategory | null) => any;
  setSearchQuery: (query: string) => any;
  setSearchResults: (results: string[]) => any;
  goBack: () => any;
  clearSearch: () => any;
}

export interface UseDocumentationOptions {
  /** Redux dispatch function */
  dispatch: (action: any) => void;
  /** Documentation state from Redux */
  helpState: DocumentationState;
  /** Documentation service instance */
  documentationService: DocumentationService;
  /** Redux action creators */
  actions: DocumentationActions;
}

export function useDocumentation(options: UseDocumentationOptions) {
  const { dispatch, helpState, documentationService, actions } = options;

  // Get current page
  const currentPage = useMemo(
    () => (helpState.currentPageId ? documentationService.getPage(helpState.currentPageId) : null),
    [helpState.currentPageId, documentationService]
  );

  // Get navigation tree
  const navigationTree = useMemo(() => documentationService.getNavigationTree(), [documentationService]);

  // Get current section pages
  const currentSectionPages = useMemo(() => {
    if (!helpState.currentCategory) return [];
    return documentationService.getPagesByCategory(helpState.currentCategory);
  }, [helpState.currentCategory, documentationService]);

  // Get search results
  const searchResults = useMemo(
    () =>
      helpState.searchResults.map((id: string) => documentationService.getPage(id)).filter(Boolean) as DocPage[],
    [helpState.searchResults, documentationService]
  );

  // Get history pages
  const historyPages = useMemo(
    () =>
      helpState.history
        .map((id: string) => documentationService.getPage(id))
        .filter(Boolean) as DocPage[],
    [helpState.history, documentationService]
  );

  // Open help
  const openHelpModal = useCallback(
    (pageId?: string, category?: DocCategory) => {
      dispatch(actions.openHelp({ pageId, category }));
    },
    [dispatch, actions]
  );

  // Close help
  const closeHelpModal = useCallback(() => {
    dispatch(actions.closeHelp());
  }, [dispatch, actions]);

  // Navigate to page
  const goToPage = useCallback(
    (pageId: string) => {
      dispatch(actions.navigateToPage(pageId));
    },
    [dispatch, actions]
  );

  // Set category
  const switchCategory = useCallback(
    (category: DocCategory | null) => {
      dispatch(actions.setCategory(category));
    },
    [dispatch, actions]
  );

  // Search
  const search = useCallback(
    (query: string) => {
      dispatch(actions.setSearchQuery(query));
      if (query.length >= 2) {
        const results = documentationService.search(query);
        dispatch(actions.setSearchResults(results.map((r) => r.id)));
      } else {
        dispatch(actions.setSearchResults([]));
      }
    },
    [dispatch, documentationService, actions]
  );

  // Go back in history
  const goBackInHistory = useCallback(() => {
    dispatch(actions.goBack());
  }, [dispatch, actions]);

  // Clear search
  const clearSearchResults = useCallback(() => {
    dispatch(actions.clearSearch());
  }, [dispatch, actions]);

  // Get related pages
  const relatedPages = useMemo(
    () => (currentPage ? documentationService.getRelatedPages(currentPage.id) : []),
    [currentPage, documentationService]
  );

  // Get breadcrumbs
  const breadcrumbs = useMemo(
    () => (currentPage ? documentationService.getBreadcrumbs(currentPage.id) : []),
    [currentPage, documentationService]
  );

  // Check if can go back
  const canGoBack = helpState.history.length > 1;

  // Get documentation stats
  const stats = useMemo(() => documentationService.getStats(), [documentationService]);

  return {
    // State
    isOpen: helpState.isOpen,
    currentPage,
    currentCategory: helpState.currentCategory,
    searchQuery: helpState.searchQuery,
    searchResults,
    history: historyPages,
    canGoBack,

    // Navigation
    navigationTree,
    currentSectionPages,
    relatedPages,
    breadcrumbs,

    // Actions
    openHelpModal,
    closeHelpModal,
    goToPage,
    switchCategory,
    search,
    goBackInHistory,
    clearSearchResults,

    // Utilities
    documentationService,
    stats,
  };
}

export default useDocumentation;
