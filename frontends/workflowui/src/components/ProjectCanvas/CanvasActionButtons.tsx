/**
 * CanvasActionButtons - Optional canvas action buttons (add, layout, settings)
 */

import React from 'react';

interface CanvasActionButtonsProps {
  onAddWorkflow?: () => void;
  onAutoLayout?: () => void;
  onOpenSettings?: () => void;
}

export default function CanvasActionButtons({
  onAddWorkflow,
  onAutoLayout,
  onOpenSettings,
}: CanvasActionButtonsProps) {
  return (
    <div>
      {onAddWorkflow && (
        <button
          onClick={onAddWorkflow}
          title="Add workflow to canvas"
          aria-label="Add workflow"
        >
          + Add Workflow
        </button>
      )}
      {onAutoLayout && (
        <button
          onClick={onAutoLayout}
          title="Auto-arrange workflows"
          aria-label="Auto-layout"
        >
          ⊞ Layout
        </button>
      )}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          title="Canvas settings"
          aria-label="Settings"
        >
          ⚙
        </button>
      )}
    </div>
  );
}
