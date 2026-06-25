/** ExecutionToolbar - Execute, save, and validate buttons */

import React from 'react';
import { useWorkflow, useExecution } from '@metabuilder/hooks-data';
import { useUI } from '../../../hooks';
import {
  SaveIcon, ExecuteIcon, ValidateIcon,
} from './ToolbarIcons';
import {
  doSave, doExecute, doValidate,
} from './toolbarHandlers';

interface ExecutionToolbarProps {
  workflowId: string;
  onValidationShow?: (show: boolean) => void;
}

export const ExecutionToolbar: React.FC<
  ExecutionToolbarProps
> = ({ workflowId, onValidationShow }) => {
  const { workflow, isDirty, isSaving, save, validate } =
    useWorkflow();
  const { currentExecution, execute } = useExecution();
  const { setLoading, setLoadingMessage } = useUI();

  const isExecuting =
    currentExecution?.status === 'running';

  return (
    <div>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => doSave(save)}
        disabled={!isDirty || isSaving}
        title="Save workflow (Ctrl+S)"
      >
        <SaveIcon />
        Save
        {isSaving && <span />}
      </button>

      <button
        className="btn btn-primary btn-sm"
        onClick={() => doExecute(
          workflowId, validate, execute,
          setLoading, setLoadingMessage, onValidationShow
        )}
        disabled={!workflow || isExecuting}
        title="Execute workflow (Shift+Enter)"
      >
        <ExecuteIcon />
        Execute
        {isExecuting && <span />}
      </button>

      <button
        className="btn btn-ghost btn-sm"
        onClick={() =>
          doValidate(validate, onValidationShow)
        }
        title="Validate workflow"
      >
        <ValidateIcon />
        Validate
      </button>
    </div>
  );
};

export default ExecutionToolbar;
