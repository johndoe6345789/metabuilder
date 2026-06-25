/**
 * useTemplatesPage - Filter and view mode state for templates page
 */

'use client';

import { useState, useMemo } from 'react';
import {
  templateService,
  type TemplateCategory,
  type TemplateFilters,
} from '@metabuilder/services';

export function useTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | 'all'
  >('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced' | 'all'
  >('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    'grid'
  );

  const allTemplates = templateService.getAllTemplates();
  const categories = templateService.getCategories();
  const stats = templateService.getStats();

  const filteredTemplates = useMemo(() => {
    const filters: TemplateFilters = {
      searchQuery:
        searchQuery.length > 0 ? searchQuery : undefined,
    };
    if (selectedCategory !== 'all') {
      filters.category = selectedCategory;
    }
    if (selectedDifficulty !== 'all') {
      filters.difficulty = selectedDifficulty as any;
    }
    return templateService.searchTemplates(filters);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    viewMode,
    setViewMode,
    allTemplates,
    categories,
    stats,
    filteredTemplates,
    resetFilters,
  };
}
