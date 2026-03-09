/**
 * NodePalette Component
 * Right sidebar with search, language filter, and categorized node list
 */

'use client';

import React, { DragEvent } from 'react';
import type { NodeType } from './types';
import { NODE_CATEGORIES, NODE_TYPES } from './node-definitions';
import { PaletteNode } from './PaletteNode';
import { PaletteHeader } from './PaletteHeader';
import { PaletteCategories } from './PaletteCategories';
import styles from '../../scss/atoms/workflow-editor.module.scss';

export interface NodePaletteProps {
  nodeSearch: string;
  onSearchChange: (value: string) => void;
  expandedCategories: Record<string, boolean>;
  onToggleCategory: (category: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDragStart: (e: DragEvent, nodeType: NodeType) => void;
  nodeTypes?: NodeType[];
  categories?: Record<string, { id: string; name: string; color: string }>;
  languages?: string[];
  languageHealth?: Record<string, boolean>;
  selectedLanguage?: string | null;
  onLanguageChange?: (lang: string | null) => void;
  isLoading?: boolean;
}

export function NodePalette({
  nodeSearch,
  onSearchChange,
  expandedCategories,
  onToggleCategory,
  onExpandAll,
  onCollapseAll,
  onDragStart,
  nodeTypes,
  categories,
  languages = [],
  languageHealth = {},
  selectedLanguage = null,
  onLanguageChange,
  isLoading = false,
}: NodePaletteProps): React.ReactElement {
  const unhealthyLanguages = languages.filter(lang => languageHealth[lang] === false);
  const allNodeTypes = nodeTypes || NODE_TYPES;
  const allCategories = categories || NODE_CATEGORIES;

  const filteredNodeTypes = allNodeTypes.filter(n => {
    if (selectedLanguage && n.language && n.language !== selectedLanguage) return false;
    if (nodeSearch.trim()) {
      const query = nodeSearch.toLowerCase();
      return n.name.toLowerCase().includes(query) || n.description.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query) || (n.language && n.language.toLowerCase().includes(query));
    }
    return true;
  });

  return (
    <aside className={styles.palette}>
      <PaletteHeader
        isLoading={isLoading}
        unhealthyLanguages={unhealthyLanguages}
        nodeSearch={nodeSearch}
        onSearchChange={onSearchChange}
        onExpandAll={onExpandAll}
        onCollapseAll={onCollapseAll}
        languages={languages}
        languageHealth={languageHealth}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        filteredCount={filteredNodeTypes.length}
      />

      {nodeSearch.trim() ? (
        <div className={styles.categoryContent}>
          {filteredNodeTypes.length === 0 ? (
            <p style={{ padding: 16, textAlign: 'center', color: 'var(--mat-sys-on-surface-variant)' }}>No nodes found</p>
          ) : (
            filteredNodeTypes.map(nodeType => <PaletteNode key={nodeType.id} nodeType={nodeType} onDragStart={onDragStart} />)
          )}
        </div>
      ) : (
        <PaletteCategories
          categories={allCategories}
          nodeTypes={filteredNodeTypes}
          expandedCategories={expandedCategories}
          onToggleCategory={onToggleCategory}
          onDragStart={onDragStart}
        />
      )}
    </aside>
  );
}
