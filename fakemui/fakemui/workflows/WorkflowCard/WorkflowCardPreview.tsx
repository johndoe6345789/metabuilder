/**
 * WorkflowCardPreview Component
 * Displays mini node preview and metadata
 */

import React from 'react';

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
    <div >
      <div >
        <div >
          <div >{nodeCount}</div>
          <div >nodes</div>
        </div>
      </div>
    </div>
  );
};
