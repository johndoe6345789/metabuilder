/**
 * usePluginFilter - Computes filtered plugin list
 */

'use client';

import { useMemo } from 'react';
import MOCK_PLUGINS from '../plugins.json';
import type { PluginTab } from './usePlugins';

interface UsePluginFilterInput {
  searchQuery: string;
  selectedTab: PluginTab;
  selectedCategory: string | null;
}

export function usePluginFilter({
  searchQuery,
  selectedTab,
  selectedCategory,
}: UsePluginFilterInput) {
  return useMemo(() => {
    let filtered = MOCK_PLUGINS;
    if (selectedTab === 'installed') {
      filtered = filtered.filter((p) => p.installed);
    } else if (selectedTab === 'available') {
      filtered = filtered.filter((p) => !p.installed);
    }
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category === selectedCategory
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [searchQuery, selectedTab, selectedCategory]);
}
