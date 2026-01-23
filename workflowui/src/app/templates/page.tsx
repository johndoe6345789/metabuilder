/**
 * Project Templates Page
 * Browse and select from pre-built project templates
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '../../components/Navigation/Breadcrumbs';
import { templateService } from '../../services/templateService';
import { TemplateCategory, TemplateFilters } from '../../types/template';
import styles from './templates.module.scss';

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
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📋 Templates', href: '/templates' },
        ]}
      />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Project Templates</h1>
          <p>Start with pre-built workflows and accelerate your projects</p>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Templates</span>
              <span className={styles.statValue}>{stats.totalTemplates}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Downloads</span>
              <span className={styles.statValue}>{stats.totalDownloads.toLocaleString()}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Avg Rating</span>
              <span className={styles.statValue}>
                ⭐ {stats.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            data-testid="template-search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
        </div>

        <div className={styles.filterControls}>
          <select
            data-testid="template-difficulty"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">All Difficulty Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <div className={styles.viewToggle}>
            <button
              data-testid="template-grid-view"
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
            <button
              data-testid="template-list-view"
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              ≡ List
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Sidebar Categories */}
        <aside className={styles.sidebar} role="complementary" aria-label="Template categories">
          <div className={styles.sidebarSection}>
            <h3>Categories</h3>
            <button
              data-testid="template-all-categories"
              className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Templates
              <span className={styles.count}>{allTemplates.length}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-testid={`template-category-${cat.id}`}
                className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                {cat.name}
                <span className={styles.count}>{cat.templateCount}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main} role="main">
          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultCount}>
              Showing {filteredTemplates.length} of {allTemplates.length} templates
            </p>
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No templates found</h3>
              <p>Try adjusting your filters or search query</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className={styles.grid} role="list">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className={styles.list} role="list">
                  {filteredTemplates.map((template) => (
                    <TemplateListItem key={template.id} template={template} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: any;
}

function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div
      data-testid={`template-card-${template.id}`}
      className={styles.card}
      role="listitem"
    >
      {/* Featured Badge */}
      {template.metadata.featured && (
        <div className={styles.badge} aria-label="Featured">
          ⭐ Featured
        </div>
      )}

      {/* Card Icon */}
      <div
        className={styles.cardIcon}
        style={{ backgroundColor: template.color }}
      >
        {template.icon}
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h3>{template.name}</h3>
        <p className={styles.description}>{template.description}</p>

        <div className={styles.cardMeta}>
          <span className={styles.difficulty}>
            {template.difficulty === 'beginner' && '🟢'}
            {template.difficulty === 'intermediate' && '🟡'}
            {template.difficulty === 'advanced' && '🔴'}
            {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
          </span>
          <span className={styles.workflows}>
            {template.workflows.length} workflow{template.workflows.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.rating} aria-label={`Rating ${template.metadata.rating} out of 5`}>
            {'⭐'.repeat(Math.round(template.metadata.rating || 0))}
            <span className={styles.ratingText}>
              {template.metadata.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <span className={styles.downloads}>
            ⬇️ {template.metadata.downloads?.toLocaleString() || 0}
          </span>
        </div>

        <Link href={`/templates/${template.id}` as any} className={`btn btn-primary ${styles.viewBtn}`}>
          View Template
        </Link>
      </div>
    </div>
  );
}

interface TemplateListItemProps {
  template: any;
}

function TemplateListItem({ template }: TemplateListItemProps) {
  return (
    <div
      data-testid={`template-list-item-${template.id}`}
      className={styles.listItem}
      role="listitem"
    >
      <div className={styles.listIcon} style={{ backgroundColor: template.color }}>
        {template.icon}
      </div>

      <div className={styles.listContent}>
        <div className={styles.listHeader}>
          <h3>{template.name}</h3>
          {template.metadata.featured && <span className={styles.badge}>⭐ Featured</span>}
        </div>
        <p className={styles.listDescription}>{template.description}</p>

        <div className={styles.listTags}>
          {template.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className={styles.moreTag}>+{template.tags.length - 3}</span>
          )}
        </div>
      </div>

      <div className={styles.listMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Difficulty</span>
          <span className={styles.metaValue}>
            {template.difficulty === 'beginner' && '🟢'}
            {template.difficulty === 'intermediate' && '🟡'}
            {template.difficulty === 'advanced' && '🔴'}
            {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Rating</span>
          <span className={styles.metaValue}>
            ⭐ {template.metadata.rating?.toFixed(1) || 'N/A'}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Downloads</span>
          <span className={styles.metaValue}>
            {template.metadata.downloads?.toLocaleString() || 0}
          </span>
        </div>

        <Link href={`/templates/${template.id}` as any} className="btn btn-primary btn-sm">
          View
        </Link>
      </div>
    </div>
  );
}
