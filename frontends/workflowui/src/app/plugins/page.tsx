/**
 * Plugins Page - Plugin management and marketplace
 */

'use client';

import React from 'react';
import { Breadcrumbs, Box } from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/plugins.module.scss';
import { usePlugins } from './hooks/usePlugins';
import PluginCard from './PluginCard';
import PluginDetailDialog from './PluginDetailDialog';
import PluginFilters from './PluginFilters';
import PluginEmptyState from './PluginEmptyState';
import PluginsHeader from './PluginsHeader';

export default function PluginsPage() {
  const {
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
    handlePluginClick,
    handleInstallToggle,
    handleResetFilters,
    totalPlugins,
    tabsWithCounts,
  } = usePlugins();

  return (
    <Box
      className={styles.pluginsPage}
      data-testid="plugins-page"
    >
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '🧩 Plugins', href: '/plugins' },
        ]}
      />

      <PluginsHeader
        totalPlugins={stats.totalPlugins}
        installedPlugins={stats.installedPlugins}
        totalDownloads={stats.totalDownloads}
      />

      <PluginFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        tabsWithCounts={tabsWithCounts}
        filteredCount={filteredPlugins.length}
        totalPlugins={totalPlugins}
        onResetFilters={handleResetFilters}
      />

      <Box className={styles.mainContent}>
        {filteredPlugins.length === 0 ? (
          <PluginEmptyState
            onResetFilters={handleResetFilters}
          />
        ) : (
          <Box className={styles.gridView} role="list">
            {filteredPlugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onClick={handlePluginClick}
              />
            ))}
          </Box>
        )}
      </Box>

      <PluginDetailDialog
        open={detailDialogOpen}
        plugin={selectedPlugin}
        onClose={() => setDetailDialogOpen(false)}
        onInstallToggle={handleInstallToggle}
      />
    </Box>
  );
}
