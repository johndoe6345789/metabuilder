/**
 * Template Service
 * Manages project templates and template operations
 */

import {
  ProjectTemplate,
  TemplateCategory,
  TemplateFilters,
  TemplateCategoryInfo,
} from '../types/template';
import templateData from '../data/templates.json';

const templates = (templateData as any).templates as ProjectTemplate[];
const categories = (templateData as any).categories as TemplateCategoryInfo[];

export const templateService = {
  /**
   * Get all templates
   */
  getAllTemplates(): ProjectTemplate[] {
    return templates.sort((a, b) => {
      // Featured first
      if (a.metadata.featured !== b.metadata.featured) {
        return (b.metadata.featured ? 1 : 0) - (a.metadata.featured ? 1 : 0);
      }
      // Then by rating
      return (b.metadata.rating || 0) - (a.metadata.rating || 0);
    });
  },

  /**
   * Get template by ID
   */
  getTemplate(id: string): ProjectTemplate | undefined {
    return templates.find(t => t.id === id);
  },

  /**
   * Search and filter templates
   */
  searchTemplates(filters: TemplateFilters): ProjectTemplate[] {
    let results = [...templates];

    // Category filter
    if (filters.category) {
      const categories = Array.isArray(filters.category)
        ? filters.category
        : [filters.category];
      results = results.filter(t => categories.includes(t.category));
    }

    // Difficulty filter
    if (filters.difficulty) {
      results = results.filter(t => t.difficulty === filters.difficulty);
    }

    // Featured only
    if (filters.featured) {
      results = results.filter(t => t.metadata.featured);
    }

    // Search query
    if (filters.searchQuery && filters.searchQuery.length > 0) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    return results.sort((a, b) => {
      // Featured first
      if (a.metadata.featured !== b.metadata.featured) {
        return (b.metadata.featured ? 1 : 0) - (a.metadata.featured ? 1 : 0);
      }
      // Then by rating
      return (b.metadata.rating || 0) - (a.metadata.rating || 0);
    });
  },

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: TemplateCategory): ProjectTemplate[] {
    return templates
      .filter(t => t.category === category)
      .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
  },

  /**
   * Get featured templates
   */
  getFeaturedTemplates(limit = 6): ProjectTemplate[] {
    return templates
      .filter(t => t.metadata.featured)
      .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0))
      .slice(0, limit);
  },

  /**
   * Get popular templates by downloads
   */
  getPopularTemplates(limit = 6): ProjectTemplate[] {
    return templates
      .sort((a, b) => (b.metadata.downloads || 0) - (a.metadata.downloads || 0))
      .slice(0, limit);
  },

  /**
   * Get best-rated templates
   */
  getTopRatedTemplates(limit = 6): ProjectTemplate[] {
    return templates
      .filter(t => (t.metadata.rating || 0) >= 4.5)
      .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0))
      .slice(0, limit);
  },

  /**
   * Get templates by difficulty
   */
  getTemplatesByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): ProjectTemplate[] {
    return templates
      .filter(t => t.difficulty === difficulty)
      .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
  },

  /**
   * Get all categories
   */
  getCategories(): TemplateCategoryInfo[] {
    return categories.map(cat => ({
      ...cat,
      templateCount: templates.filter(t => t.category === cat.id).length,
    }));
  },

  /**
   * Get category by ID
   */
  getCategory(id: TemplateCategory): TemplateCategoryInfo | undefined {
    const category = categories.find(c => c.id === id);
    if (!category) return undefined;

    return {
      ...category,
      templateCount: templates.filter(t => t.category === id).length,
    };
  },

  /**
   * Get all unique tags across templates
   */
  getAllTags(): string[] {
    const tagSet = new Set<string>();
    templates.forEach(t => {
      t.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },

  /**
   * Get templates with tag
   */
  getTemplatesWithTag(tag: string): ProjectTemplate[] {
    return templates
      .filter(t => t.tags.includes(tag))
      .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0));
  },

  /**
   * Get related templates
   */
  getRelatedTemplates(templateId: string, limit = 4): ProjectTemplate[] {
    const template = templates.find(t => t.id === templateId);
    if (!template) return [];

    return templates
      .filter(t => t.id !== templateId && t.category === template.category)
      .sort((a, b) => (b.metadata.rating || 0) - (a.metadata.rating || 0))
      .slice(0, limit);
  },

  /**
   * Get statistics about templates
   */
  getStats() {
    const totalTemplates = templates.length;
    const totalDownloads = templates.reduce(
      (sum, t) => sum + (t.metadata.downloads || 0),
      0
    );
    const averageRating =
      templates.reduce((sum, t) => sum + (t.metadata.rating || 0), 0) /
      totalTemplates;
    const difficultyBreakdown = {
      beginner: templates.filter(t => t.difficulty === 'beginner').length,
      intermediate: templates.filter(t => t.difficulty === 'intermediate')
        .length,
      advanced: templates.filter(t => t.difficulty === 'advanced').length,
    };

    return {
      totalTemplates,
      totalDownloads,
      averageRating: Math.round(averageRating * 100) / 100,
      totalCategories: categories.length,
      difficultyBreakdown,
    };
  },
};
