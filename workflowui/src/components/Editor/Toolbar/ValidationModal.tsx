/**
 * ValidationModal Component
 * Displays workflow validation results
 */

import React, { useEffect, useState } from 'react';
import { useWorkflow } from '../../../hooks';
import styles from '../Toolbar.module.scss';

interface ValidationModalProps {
  workflowId: string;
  onClose: () => void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const ValidationModal: React.FC<ValidationModalProps> = ({ workflowId, onClose }) => {
  const { validate } = useWorkflow();
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
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

export default ValidationModal;
