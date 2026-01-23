/**
 * useDocumentation Hook
 * Custom hook for documentation system integration
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  openHelp,
  closeHelp,
  navigateToPage,
  setCategory,
  setSearchQuery,
  setSearchResults,
  goBack,
  clearSearch,
} from '../store/slices/documentationSlice';
import { documentationService } from '../services/documentationService';
import { DocCategory, DocPage } from '../types/documentation';

export function useDocumentation() {
  const dispatch = useDispatch();
  const helpState = useSelector((state: any) => state.documentation);

  // Get current page
  const currentPage = useMemo(
    () => (helpState.currentPageId ? documentationService.getPage(helpState.currentPageId) : null),
    [helpState.currentPageId]
  );

  // Get navigation tree
  const navigationTree = useMemo(() => documentationService.getNavigationTree(), []);

  // Get current section pages
  const currentSectionPages = useMemo(() => {
    if (!helpState.currentCategory) return [];
    return documentationService.getPagesByCategory(helpState.currentCategory);
  }, [helpState.currentCategory]);

  // Get search results
  const searchResults = useMemo(
    () =>
      helpState.searchResults.map((id: string) => documentationService.getPage(id)).filter(Boolean),
    [helpState.searchResults]
  );

  // Get history pages
  const historyPages = useMemo(
    () =>
      helpState.history
        .map((id: string) => documentationService.getPage(id))
        .filter(Boolean),
    [helpState.history]
  );

  // Open help
  const openHelpModal = useCallback(
    (pageId?: string, category?: DocCategory) => {
      dispatch(openHelp({ pageId, category }));
    },
    [dispatch]
  );

  // Close help
  const closeHelpModal = useCallback(() => {
    dispatch(closeHelp());
  }, [dispatch]);

  // Navigate to page
  const goToPage = useCallback(
    (pageId: string) => {
      dispatch(navigateToPage(pageId));
    },
    [dispatch]
  );

  // Set category
  const switchCategory = useCallback(
    (category: DocCategory | null) => {
      dispatch(setCategory(category));
    },
    [dispatch]
  );

  // Search
  const search = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
      if (query.length >= 2) {
        const results = documentationService.search(query);
        dispatch(setSearchResults(results.map((r) => r.id)));
      } else {
        dispatch(setSearchResults([]));
      }
    },
    [dispatch]
  );

  // Go back in history
  const goBackInHistory = useCallback(() => {
    dispatch(goBack());
  }, [dispatch]);

  // Clear search
  const clearSearchResults = useCallback(() => {
    dispatch(clearSearch());
  }, [dispatch]);

  // Get related pages
  const relatedPages = useMemo(
    () => (currentPage ? documentationService.getRelatedPages(currentPage.id) : []),
    [currentPage]
  );

  // Get breadcrumbs
  const breadcrumbs = useMemo(
    () => (currentPage ? documentationService.getBreadcrumbs(currentPage.id) : []),
    [currentPage]
  );

  // Check if can go back
  const canGoBack = helpState.history.length > 1;

  // Get documentation stats
  const stats = useMemo(() => documentationService.getStats(), []);

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
