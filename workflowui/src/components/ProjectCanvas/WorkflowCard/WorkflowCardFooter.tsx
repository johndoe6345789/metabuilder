/**
 * WorkflowCardFooter Component
 * Displays workflow metadata (node and connection counts)
 */

import React from 'react';
import styles from '../WorkflowCard.module.scss';

interface WorkflowCardFooterProps {
  nodeCount: number;
  connectionCount: number;
}

export const WorkflowCardFooter: React.FC<WorkflowCardFooterProps> = ({
  nodeCount,
  connectionCount
}) => {
  return (
    <div className={styles.footer}>
      <span className={styles.meta}>
        {nodeCount} nodes • {connectionCount} connections
      </span>
    </div>
  );
};
