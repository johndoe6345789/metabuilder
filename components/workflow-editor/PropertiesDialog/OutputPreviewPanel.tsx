/**
 * OutputPreviewPanel - Shows output data preview for a node
 */

'use client';

import React from 'react';
import type { WorkflowNode } from '../types';
import styles from '../../../scss/atoms/workflow-editor.module.scss';

const UpArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
  </svg>
);

interface OutputPreviewPanelProps {
  node: WorkflowNode;
  preview?: Record<string, unknown>;
}

export function OutputPreviewPanel({ node, preview }: OutputPreviewPanelProps) {
  const mockPreview = preview || {
    result: { processed: true, items: ['transformed1', 'transformed2'] },
    meta: { nodeId: node.id, executionTime: '12ms' },
  };

  return (
    <div className={styles.propertiesPanel}>
      <div className={styles.propertiesPanelHeader}>
        <span className={styles.propertiesPanelTitle}>
          <UpArrowIcon />
          Output Preview
        </span>
        <span className={styles.propertiesPanelBadge}>
          {node.outputs.length} output{node.outputs.length !== 1 ? 's' : ''}
        </span>
      </div>
      <pre className={styles.propertiesPreview}>
        {JSON.stringify(mockPreview, null, 2)}
      </pre>
      <p className={styles.propertiesHint}>Run workflow to see actual output</p>
    </div>
  );
}
