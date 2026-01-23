/**
 * Documentation Service
 * Loads and manages documentation content
 */

import {
  DocumentationIndex,
  DocPage,
  DocSection,
  DocCategory,
  SearchIndexEntry,
} from '../types/documentation';
import docContent from '../data/documentation.json';

/**
 * Service for accessing documentation content
 */
const docIndex = docContent as unknown as DocumentationIndex;

export const documentationService = {
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
