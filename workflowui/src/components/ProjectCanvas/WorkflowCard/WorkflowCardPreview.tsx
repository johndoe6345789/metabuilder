/**
 * WorkflowCardPreview Component
 * Displays mini node preview and metadata
 */

import React from 'react';
import styles from '../WorkflowCard.module.scss';

interface WorkflowCardPreviewProps {
  nodeCount: number;
  isMinimized: boolean;
}

export const WorkflowCardPreview: React.FC<WorkflowCardPreviewProps> = ({
  nodeCount,
  isMinimized
}) => {
  if (isMinimized) {
    return null;
  }

  return (
    <div className={styles.body}>
      <div className={styles.preview}>
        <div className={styles.previewContent}>
          <div className={styles.nodeCount}>{nodeCount}</div>
          <div className={styles.label}>nodes</div>
        </div>
      </div>
    </div>
  );
};
