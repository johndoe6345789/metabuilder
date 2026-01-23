/**
 * Toolbar Component
 * Top toolbar with save, execute, undo/redo, and zoom controls
 */

import React, { useState } from 'react';
import { useWorkflow, useExecution, useEditor, useUI } from '@hooks';
import styles from './Toolbar.module.scss';

interface ToolbarProps {
  workflowId: string;
  onValidate?: () => Promise<boolean>;
}

export const Toolbar: React.FC<ToolbarProps> = ({ workflowId, onValidate }) => {
  const { workflow, isDirty, isSaving, save, validate } = useWorkflow();
  const { currentExecution, execute } = useExecution();
  const { zoom, zoomIn, zoomOut, resetZoom } = useEditor();
  const { setLoading, setLoadingMessage } = useUI();
  const [showValidation, setShowValidation] = useState(false);

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

      // Validate workflow first
      const validation = await validate();
      if (!validation.valid) {
        setShowValidation(true);
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
      const validation = await validate();
      setShowValidation(true);
    } catch (error) {
      console.error('Failed to validate:', error);
    }
  };

  const isExecuting = currentExecution?.status === 'running';

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
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
          {isSaving && <span className={styles.spinner}></span>}
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
          {isExecuting && <span className={styles.spinner}></span>}
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

      <div className={styles.toolbarGroup}>
        <div className={styles.zoomControl}>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={zoomOut}
            title="Zoom out (Ctrl+-)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
              <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
            </svg>
          </button>

          <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>

          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={zoomIn}
            title="Zoom in (Ctrl++)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
              <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" />
              <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
            </svg>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={resetZoom}
            title="Reset zoom (Ctrl+0)"
          >
            100%
          </button>
        </div>

        <button
          className="btn btn-ghost btn-sm btn-icon"
          title="More options"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {showValidation && <ValidationResults workflowId={workflowId} onClose={() => setShowValidation(false)} />}
    </div>
  );
};

interface ValidationResultsProps {
  workflowId: string;
  onClose: () => void;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({ workflowId, onClose }) => {
  const { workflow, validate } = useWorkflow();
  const [validation, setValidation] = React.useState<any>(null);

  React.useEffect(() => {
    const runValidation = async () => {
      try {
        const result = await validate();
        setValidation(result);
      } catch (error) {
        console.error('Validation error:', error);
      }
    };

    runValidation();
  }, [validate]);

  if (!validation) {
    return null;
  }

  return (
    <div className={styles.validationOverlay} onClick={onClose}>
      <div className={styles.validationModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.validationHeader}>
          <h3>Validation Results</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className={styles.validationBody}>
          {validation.valid ? (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <div className={styles.validationContent}>
                <p>Workflow is valid and ready to execute</p>
              </div>
            </div>
          ) : (
            <>
              {validation.errors.length > 0 && (
                <div className="alert alert-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  <div className={styles.validationContent}>
                    <p className={styles.validationLabel}>Errors:</p>
                    <ul className={styles.validationList}>
                      {validation.errors.map((error: string, i: number) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="alert alert-warning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  <div className={styles.validationContent}>
                    <p className={styles.validationLabel}>Warnings:</p>
                    <ul className={styles.validationList}>
                      {validation.warnings.map((warning: string, i: number) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.validationFooter}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
