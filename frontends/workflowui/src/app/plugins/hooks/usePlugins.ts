/**
 * usePlugins - Plugin filtering and dialog state
 */

'use client';

import { useState } from 'react';
import MOCK_PLUGINS from '../plugins.json';
import CATEGORIES from '../plugin-categories.json';
import { usePluginFilter } from './usePluginFilter';

export type PluginTab = 'all' | 'installed' | 'available';

export type Plugin = (typeof MOCK_PLUGINS)[0];

export function usePlugins() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] =
    useState<PluginTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<
    string | null
  >(null);
  const [detailDialogOpen, setDetailDialogOpen] =
    useState(false);
  const [selectedPlugin, setSelectedPlugin] =
    useState<Plugin | null>(null);

  const filteredPlugins = usePluginFilter({
    searchQuery,
    selectedTab,
    selectedCategory,
  });

  const stats = {
    totalPlugins: MOCK_PLUGINS.length,
    installedPlugins: MOCK_PLUGINS.filter(
      (p) => p.installed
    ).length,
    totalDownloads: MOCK_PLUGINS.reduce(
      (sum, p) => sum + p.downloads,
      0
    ),
  };

  const tabsWithCounts = CATEGORIES.tabs.map((t) => ({
    ...t,
    count:
      t.id === 'all'
        ? stats.totalPlugins
        : t.id === 'installed'
        ? stats.installedPlugins
        : stats.totalPlugins - stats.installedPlugins,
  }));

  const handlePluginClick = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setDetailDialogOpen(true);
  };

  const handleInstallToggle = () => {
    if (selectedPlugin) {
      console.log(
        `${
          selectedPlugin.installed
            ? 'Uninstalling'
            : 'Installing'
        } ${selectedPlugin.name}`
      );
      setDetailDialogOpen(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTab('all');
    setSelectedCategory(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    selectedCategory,
    setSelectedCategory,
    detailDialogOpen,
    setDetailDialogOpen,
    selectedPlugin,
    filteredPlugins,
    stats,
    tabsWithCounts,
    handlePluginClick,
    handleInstallToggle,
    handleResetFilters,
    totalPlugins: MOCK_PLUGINS.length,
  };
}
