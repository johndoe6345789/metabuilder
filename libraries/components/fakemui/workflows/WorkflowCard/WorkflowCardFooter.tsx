/**
 * WorkflowCardFooter Component
 * Displays workflow metadata (node and connection counts)
 */

import React from 'react';

interface WorkflowCardFooterProps {
  nodeCount: number;
  connectionCount: number;
  testId?: string;
}

export const WorkflowCardFooter: React.FC<WorkflowCardFooterProps> = ({
  nodeCount,
  connectionCount,
  testId,
}) => {
  return (
    <div data-testid={testId}>
      <span >
        {nodeCount} nodes • {connectionCount} connections
      </span>
    </div>
  );
};
