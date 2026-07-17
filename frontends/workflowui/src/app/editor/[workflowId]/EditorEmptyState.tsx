/**
 * EditorEmptyState - Placeholder shown when the canvas has no nodes
 */

'use client';

import React from 'react';
import styles from '@scss/atoms/workflow-editor.module.scss';

export default function EditorEmptyState() {
  return (
    <div className={styles.emptyState}>
      <h3 className={styles.emptyStateTitle}>
        Drop nodes here to start
      </h3>
      <p className={styles.emptyStateText}>
        Drag nodes from the palette on the right
      </p>
    </div>
  );
}
