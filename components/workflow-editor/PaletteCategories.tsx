/**
 * PaletteCategories Component
 * Renders categorized node list with expand/collapse
 */

'use client';

import React, { DragEvent } from 'react';
import type { NodeType } from './types';
import { PaletteNode } from './PaletteNode';
import { ChevronDownIcon } from './icons';
import styles from '../../scss/atoms/workflow-editor.module.scss';

interface PaletteCategoriesProps {
  categories: Record<string, { id: string; name: string; color: string }>;
  nodeTypes: NodeType[];
  expandedCategories: Record<string, boolean>;
  onToggleCategory: (category: string) => void;
  onDragStart: (e: DragEvent, nodeType: NodeType) => void;
}

export function PaletteCategories({
  categories,
  nodeTypes,
  expandedCategories,
  onToggleCategory,
  onDragStart,
}: PaletteCategoriesProps): React.ReactElement {
  return (
    <>
      {Object.entries(categories).map(([categoryKey, category]) => {
        const categoryNodes = nodeTypes.filter(n => n.category === categoryKey);
        if (categoryNodes.length === 0) return null;

        return (
          <div key={categoryKey}>
            <div className={styles.categoryHeader} onClick={() => onToggleCategory(categoryKey)}>
              <div className={styles.categoryLabel}>
                <span className={styles.categoryDot} style={{ backgroundColor: category.color }} />
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryCount}>{categoryNodes.length}</span>
              </div>
              <span className={`${styles.categoryChevron} ${expandedCategories[categoryKey] ? styles.expanded : ''}`}>
                <ChevronDownIcon />
              </span>
            </div>

            {expandedCategories[categoryKey] && (
              <div className={styles.categoryContent}>
                {categoryNodes.map(nodeType => (
                  <PaletteNode key={nodeType.id} nodeType={nodeType} onDragStart={onDragStart} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
