/**
 * Documentation Type System
 * JSON-backed in-app help and documentation
 */

/**
 * Documentation content block types
 */
export type DocContentType =
  | 'text'
  | 'heading'
  | 'code'
  | 'list'
  | 'image'
  | 'video'
  | 'table'
  | 'callout'
  | 'step'
  | 'example';

/**
 * Documentation categories for organization
 */
export type DocCategory =
  | 'getting-started'
  | 'canvas'
  | 'workflows'
  | 'settings'
  | 'keyboard-shortcuts'
  | 'troubleshooting'
  | 'faq'
  | 'best-practices';

/**
 * Content block representing a section of documentation
 */
export interface DocContentBlock {
  type: DocContentType;
  content: string;
  title?: string;
  level?: number; // For headings
  language?: string; // For code blocks
  icon?: string; // For callouts/steps
  variant?: 'info' | 'warning' | 'error' | 'success'; // For callouts
  items?: string[]; // For lists
  columns?: string[]; // For tables
  rows?: (string | number)[][]; // For tables
  subtext?: string; // Additional text (callout footnotes, etc.)
}

/**
 * Single documentation page/article
 */
export interface DocPage {
  id: string;
  title: string;
  category: DocCategory;
  description?: string;
  content: DocContentBlock[];
  relatedPages?: string[]; // IDs of related doc pages
  keywords?: string[]; // For search
  lastUpdated?: number; // Timestamp
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number; // In minutes
}

/**
 * Documentation section (collection of pages)
 */
export interface DocSection {
  id: string;
  title: string;
  description?: string;
  category: DocCategory;
  pages: string[]; // IDs of doc pages in order
  icon?: string;
  order?: number;
}

/**
 * Complete documentation structure
 */
export interface DocumentationIndex {
  version: string;
  lastUpdated: number;
  sections: DocSection[];
  pages: Record<string, DocPage>;
  searchIndex?: SearchIndexEntry[];
}

/**
 * Search index entry for full-text search
 */
export interface SearchIndexEntry {
  pageId: string;
  title: string;
  category: DocCategory;
  content: string;
  keywords: string[];
}

/**
 * Context-specific help topics that can be triggered from UI
 */
export interface ContextualHelp {
  id: string;
  targetElement: string; // CSS selector or data-testid
  title: string;
  shortTip: string;
  fullDocPageId?: string; // Link to full documentation
  keyboard?: string; // Keyboard shortcut to trigger
}

/**
 * Help modal state
 */
export interface HelpState {
  isOpen: boolean;
  currentPageId: string | null;
  currentCategory: DocCategory | null;
  searchQuery: string;
  searchResults: string[]; // Page IDs
  history: string[]; // Previously viewed pages
}

/**
 * Keyboard shortcut documentation
 */
export interface KeyboardShortcutDoc {
  keys: string[];
  description: string;
  category: 'navigation' | 'editing' | 'canvas' | 'general';
  platforms?: ('windows' | 'mac' | 'linux')[];
  context?: string; // Where shortcut applies
}
