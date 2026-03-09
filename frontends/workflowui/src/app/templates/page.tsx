/**
 * Project Templates Page
 * Browse and select from pre-built project templates
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Breadcrumbs, Button, Box, Typography } from '@metabuilder/fakemui';
import { templateService, type TemplateCategory, type TemplateFilters } from '@metabuilder/services';
import { TemplateCard, TemplateListItem } from '@metabuilder/components/cards';
import { TemplateFilters as Filters, TemplateSidebar } from '@metabuilder/components/navigation';
import styles from '@/../../../scss/atoms/templates.module.scss';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get all templates
  const allTemplates = templateService.getAllTemplates();
  const categories = templateService.getCategories();
  const stats = templateService.getStats();

  // Filter templates
  const filteredTemplates = useMemo(() => {
    const filters: TemplateFilters = {
      searchQuery: searchQuery.length > 0 ? searchQuery : undefined,
    };

    if (selectedCategory !== 'all') {
      filters.category = selectedCategory;
    }

    if (selectedDifficulty !== 'all') {
      filters.difficulty = selectedDifficulty as any;
    }

    return templateService.searchTemplates(filters);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  return (
    <Box className={styles.templatesPage}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📋 Templates', href: '/templates' },
        ]}
      />

      {/* Header */}
      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Typography variant="h3">Project Templates</Typography>
          <Typography variant="body1" color="text.secondary">
            Start with pre-built workflows and accelerate your projects
          </Typography>
          <Box className={styles.stats}>
            <Box className={styles.statItem}>
              <Typography variant="caption">Templates</Typography>
              <Typography variant="h5">{stats.totalTemplates}</Typography>
            </Box>
            <Box className={styles.statItem}>
              <Typography variant="caption">Downloads</Typography>
              <Typography variant="h5">{stats.totalDownloads.toLocaleString()}</Typography>
            </Box>
            <Box className={styles.statItem}>
              <Typography variant="caption">Avg Rating</Typography>
              <Typography variant="h5">⭐ {stats.averageRating.toFixed(1)}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Filters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        difficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <Box className={styles.mainLayout}>
        {/* Sidebar */}
        <TemplateSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalTemplates={allTemplates.length}
        />

        {/* Main Content */}
        <Box component="main" role="main" className={styles.mainContent}>
          <Typography variant="body2" color="text.secondary" className={styles.resultsCount}>
            Showing {filteredTemplates.length} of {allTemplates.length} templates
          </Typography>

          {/* Empty State */}
          {filteredTemplates.length === 0 ? (
            <Box className={styles.emptyState}>
              <Typography variant="h1" className={styles.emptyIcon}>🔍</Typography>
              <Typography variant="h5">No templates found</Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your filters or search query
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
              >
                Reset Filters
              </Button>
            </Box>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <Box className={styles.gridView} role="list">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </Box>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <Box className={styles.listView} role="list">
                  {filteredTemplates.map((template) => (
                    <TemplateListItem key={template.id} template={template} />
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
