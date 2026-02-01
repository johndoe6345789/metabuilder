/**
 * WorkflowCardFooter Component
 * Displays workflow metadata (node and connection counts)
 */

import React from 'react';

interface WorkflowCardFooterProps {
  nodeCount: number;
  connectionCount: number;
}

export const WorkflowCardFooter: React.FC<WorkflowCardFooterProps> = ({
  nodeCount,
  connectionCount
}) => {
  return (
    <div >
      <span >
        {nodeCount} nodes • {connectionCount} connections
      </span>
    </div>
  );
};
