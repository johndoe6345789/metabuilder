/**
 * ExecutionToolbar Component
 * Execute, save, and validate buttons
 */

import React, { useState } from 'react';
import { useWorkflow, useExecution } from '@metabuilder/hooks-data';
import { useUI } from '../../../hooks';

interface ExecutionToolbarProps {
  workflowId: string;
  onValidationShow?: (show: boolean) => void;
}

export const ExecutionToolbar: React.FC<ExecutionToolbarProps> = ({
  workflowId,
  onValidationShow
}) => {
  const { workflow, isDirty, isSaving, save, validate } = useWorkflow();
  const { currentExecution, execute } = useExecution();
  const { setLoading, setLoadingMessage } = useUI();

  const handleSave = async () => {
    try {
      await save();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleExecute = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Validating workflow...');

      const validation = await validate();
      if (!validation.valid) {
        onValidationShow?.(true);
        setLoading(false);
        return;
      }

      setLoadingMessage('Executing workflow...');
      await execute(workflowId);
    } catch (error) {
      console.error('Failed to execute:', error);
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleValidate = async () => {
    try {
      await validate();
      onValidationShow?.(true);
    } catch (error) {
      console.error('Failed to validate:', error);
    }
  };

  const isExecuting = currentExecution?.status === 'running';

  return (
    <div >
      <button
        className="btn btn-secondary btn-sm"
        onClick={handleSave}
        disabled={!isDirty || isSaving}
        title="Save workflow (Ctrl+S)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save
        {isSaving && <span ></span>}
      </button>

      <button
        className="btn btn-primary btn-sm"
        onClick={handleExecute}
        disabled={!workflow || isExecuting}
        title="Execute workflow (Shift+Enter)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Execute
        {isExecuting && <span ></span>}
      </button>

      <button
        className="btn btn-ghost btn-sm"
        onClick={handleValidate}
        title="Validate workflow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12" strokeWidth="2" />
        </svg>
        Validate
      </button>
    </div>
  );
};

export default ExecutionToolbar;
