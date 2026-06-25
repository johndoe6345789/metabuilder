/**
 * InputPreviewPanel - Shows input data preview for a node
 */

'use client';

import React from 'react';
import type { WorkflowNode } from '../types';
import styles from '../../../scss/atoms/workflow-editor.module.scss';

const DownArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
    <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
  </svg>
);

interface InputPreviewPanelProps {
  node: WorkflowNode;
  preview?: Record<string, unknown>;
}

export function InputPreviewPanel({ node, preview }: InputPreviewPanelProps) {
  const mockPreview = preview || {
    data: node.inputs.length > 0 ? { items: ['item1', 'item2'], count: 2 } : null,
    meta: { source: 'previous_node', timestamp: new Date().toISOString() },
  };

  return (
    <div className={styles.propertiesPanel}>
      <div className={styles.propertiesPanelHeader}>
        <span className={styles.propertiesPanelTitle}>
          <DownArrowIcon />
          Input Preview
        </span>
        <span className={styles.propertiesPanelBadge}>
          {node.inputs.length} input{node.inputs.length !== 1 ? 's' : ''}
        </span>
      </div>
      <pre className={styles.propertiesPreview}>
        {JSON.stringify(mockPreview, null, 2)}
      </pre>
      {node.inputs.length === 0 && (
        <p className={styles.propertiesHint}>This is a trigger node - no inputs expected</p>
      )}
    </div>
  );
}
