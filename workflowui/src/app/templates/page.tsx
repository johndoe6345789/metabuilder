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
    <div >
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📋 Templates', href: '/templates' },
        ]}
      />

      {/* Header */}
      <div >
        <div >
          <h1>Project Templates</h1>
          <p>Start with pre-built workflows and accelerate your projects</p>
          <div >
            <div >
              <span >Templates</span>
              <span >{stats.totalTemplates}</span>
            </div>
            <div >
              <span >Downloads</span>
              <span >{stats.totalDownloads.toLocaleString()}</span>
            </div>
            <div >
              <span >Avg Rating</span>
              <span >
                ⭐ {stats.averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div >
        <div >
          <input
            type="text"
            data-testid="template-search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
        </div>

        <div >
          <select
            data-testid="template-difficulty"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            
          >
            <option value="all">All Difficulty Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <div >
            <button
              data-testid="template-grid-view"
              className={""}
              onClick={() => setViewMode('grid')}
            >
              ⊞ Grid
            </button>
            <button
              data-testid="template-list-view"
              className={""}
              onClick={() => setViewMode('list')}
            >
              ≡ List
            </button>
          </div>
        </div>
      </div>

      <div >
        {/* Sidebar Categories */}
        <aside  role="complementary" aria-label="Template categories">
          <div >
            <h3>Categories</h3>
            <button
              data-testid="template-all-categories"
              className={""}
              onClick={() => setSelectedCategory('all')}
            >
              All Templates
              <span >{allTemplates.length}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-testid={`template-category-${cat.id}`}
                className={""}
                onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
              >
                <span >{cat.icon}</span>
                {cat.name}
                <span >{cat.templateCount}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main  role="main">
          {/* Results Header */}
          <div >
            <p >
              Showing {filteredTemplates.length} of {allTemplates.length} templates
            </p>
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 ? (
            <div >
              <div >🔍</div>
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
                <div  role="list">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div  role="list">
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
      
      role="listitem"
    >
      {/* Featured Badge */}
      {template.metadata.featured && (
        <div  aria-label="Featured">
          ⭐ Featured
        </div>
      )}

      {/* Card Icon */}
      <div
        
        style={{ backgroundColor: template.color }}
      >
        {template.icon}
      </div>

      {/* Card Content */}
      <div >
        <h3>{template.name}</h3>
        <p >{template.description}</p>

        <div >
          <span >
            {template.difficulty === 'beginner' && '🟢'}
            {template.difficulty === 'intermediate' && '🟡'}
            {template.difficulty === 'advanced' && '🔴'}
            {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
          </span>
          <span >
            {template.workflows.length} workflow{template.workflows.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div >
          <div  aria-label={`Rating ${template.metadata.rating} out of 5`}>
            {'⭐'.repeat(Math.round(template.metadata.rating || 0))}
            <span >
              {template.metadata.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <span >
            ⬇️ {template.metadata.downloads?.toLocaleString() || 0}
          </span>
        </div>

        <Link href={`/templates/${template.id}` as any} className={""}>
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
      
      role="listitem"
    >
      <div  style={{ backgroundColor: template.color }}>
        {template.icon}
      </div>

      <div >
        <div >
          <h3>{template.name}</h3>
          {template.metadata.featured && <span >⭐ Featured</span>}
        </div>
        <p >{template.description}</p>

        <div >
          {template.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span >+{template.tags.length - 3}</span>
          )}
        </div>
      </div>

      <div >
        <div >
          <span >Difficulty</span>
          <span >
            {template.difficulty === 'beginner' && '🟢'}
            {template.difficulty === 'intermediate' && '🟡'}
            {template.difficulty === 'advanced' && '🔴'}
            {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
          </span>
        </div>

        <div >
          <span >Rating</span>
          <span >
            ⭐ {template.metadata.rating?.toFixed(1) || 'N/A'}
          </span>
        </div>

        <div >
          <span >Downloads</span>
          <span >
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
