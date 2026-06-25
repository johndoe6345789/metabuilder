/**
 * Documentation Service
 * Loads and manages documentation content
 *
 * This service is designed to be framework-agnostic and can be used
 * with any documentation index that follows the DocumentationIndex schema.
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
 * Documentation service instance type
 */
export interface IDocumentationService {
  getIndex(): DocumentationIndex;
  getSections(): DocSection[];
  getSectionByCategory(category: DocCategory): DocSection | undefined;
  getPage(pageId: string): DocPage | undefined;
  getPagesBySection(sectionId: string): DocPage[];
  getPagesByCategory(category: DocCategory): DocPage[];
  search(query: string): DocPage[];
  getRelatedPages(pageId: string): DocPage[];
  getPagesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): DocPage[];
  getPagesByReadTime(minTime: number, maxTime: number): DocPage[];
  getRecentPages(limit?: number): DocPage[];
  getBreadcrumbs(pageId: string): Array<{ id: string; title: string }>;
  getNavigationTree(): Array<{ section: DocSection; pages: DocPage[] }>;
  hasCategory(category: DocCategory): boolean;
  getStats(): {
    totalPages: number;
    totalSections: number;
    totalWords: number;
    averageReadTime: number;
    lastUpdated: number;
  };
}

/**
 * Creates a documentation service instance with the provided documentation index
 *
 * @param docContent - The documentation index data
 * @returns A documentation service instance
 *
 * @example
 * ```ts
 * import docContent from '../data/documentation.json';
 * const docService = createDocumentationService(docContent);
 * const sections = docService.getSections();
 * ```
 */
export function createDocumentationService(
  docContent: DocumentationIndex
): IDocumentationService {
  const docIndex = docContent;

  return {
    /**
     * Get the complete documentation index
     */
    getIndex(): DocumentationIndex {
      return docIndex;
    },

    /**
     * Get all sections
     */
    getSections(): DocSection[] {
      return docIndex.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    /**
     * Get section by category
     */
    getSectionByCategory(category: DocCategory): DocSection | undefined {
      return docIndex.sections.find((s) => s.category === category);
    },

    /**
     * Get a specific page by ID
     */
    getPage(pageId: string): DocPage | undefined {
      return docIndex.pages[pageId];
    },

    /**
     * Get all pages in a section
     */
    getPagesBySection(sectionId: string): DocPage[] {
      const section = docIndex.sections.find((s) => s.id === sectionId);
      if (!section) return [];

      return section.pages
        .map((pageId) => docIndex.pages[pageId])
        .filter((page): page is DocPage => !!page);
    },

    /**
     * Get pages by category
     */
    getPagesByCategory(category: DocCategory): DocPage[] {
      return Object.values(docIndex.pages).filter(
        (page): page is DocPage => page.category === category
      );
    },

    /**
     * Search documentation by query
     */
    search(query: string): DocPage[] {
      if (!query || query.length < 2) return [];

      const lowerQuery = query.toLowerCase();

      return Object.values(docIndex.pages).filter((page): page is DocPage => {
        // Search in title
        if (page.title.toLowerCase().includes(lowerQuery)) return true;

        // Search in description
        if (page.description && page.description.toLowerCase().includes(lowerQuery))
          return true;

        // Search in keywords
        if (
          page.keywords &&
          page.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
        )
          return true;

        // Search in content
        return page.content.some((block) => {
          if (typeof block.content === 'string') {
            return block.content.toLowerCase().includes(lowerQuery);
          }
          if (block.items && Array.isArray(block.items)) {
            return block.items.some((item) =>
              item.toLowerCase().includes(lowerQuery)
            );
          }
          return false;
        });
      });
    },

    /**
     * Get related pages for a given page
     */
    getRelatedPages(pageId: string): DocPage[] {
      const page = docIndex.pages[pageId];
      if (!page || !page.relatedPages) return [];

      return page.relatedPages
        .map((id) => docIndex.pages[id])
        .filter((p): p is DocPage => !!p);
    },

    /**
     * Get pages of a specific difficulty level
     */
    getPagesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): DocPage[] {
      return Object.values(docIndex.pages).filter(
        (page): page is DocPage => page.difficulty === difficulty
      );
    },

    /**
     * Get pages by estimated read time range (in minutes)
     */
    getPagesByReadTime(minTime: number, maxTime: number): DocPage[] {
      return Object.values(docIndex.pages).filter(
        (page): page is DocPage =>
          (page.estimatedReadTime || 0) >= minTime &&
          (page.estimatedReadTime || 0) <= maxTime
      );
    },

    /**
     * Get recently updated pages
     */
    getRecentPages(limit = 5): DocPage[] {
      return Object.values(docIndex.pages)
        .filter((page): page is DocPage => !!page.lastUpdated)
        .sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0))
        .slice(0, limit);
    },

    /**
     * Get breadcrumb navigation for a page
     */
    getBreadcrumbs(pageId: string): Array<{ id: string; title: string }> {
      const page = docIndex.pages[pageId];
      if (!page) return [];

      const section = docIndex.sections.find((s) => s.category === page.category);
      if (!section) {
        return [{ id: pageId, title: page.title }];
      }

      return [
        { id: section.id, title: section.title },
        { id: pageId, title: page.title },
      ];
    },

    /**
     * Get navigation tree for sidebar
     */
    getNavigationTree(): Array<{
      section: DocSection;
      pages: DocPage[];
    }> {
      return docIndex.sections.map((section) => ({
        section,
        pages: section.pages
          .map((pageId) => docIndex.pages[pageId])
          .filter((page): page is DocPage => !!page),
      }));
    },

    /**
     * Check if documentation exists for a category
     */
    hasCategory(category: DocCategory): boolean {
      return docIndex.sections.some((s) => s.category === category);
    },

    /**
     * Get statistics about documentation
     */
    getStats() {
      const pages = Object.values(docIndex.pages).filter((p): p is DocPage => !!p);

      return {
        totalPages: pages.length,
        totalSections: docIndex.sections.length,
        totalWords: pages.reduce(
          (sum, page) =>
            sum +
            page.content.reduce((pageSum, block) => {
              if (typeof block.content === 'string') {
                return pageSum + block.content.split(/\s+/).length;
              }
              return pageSum;
            }, 0),
          0
        ),
        averageReadTime: Math.round(
          pages.reduce((sum, p) => sum + (p.estimatedReadTime || 0), 0) / pages.length
        ),
        lastUpdated: docIndex.lastUpdated,
      };
    },
  };
}
