/**
 * HeaderSearch — universal search widget for the header toolbar
 */
export interface HeaderSearchProps {
  /** Callback to navigate to a page when a search result is selected */
  onNavigate?: (page: string) => void
}
