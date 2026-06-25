/**
 * ValidationModal Component
 * Displays workflow validation results
 */

import React, { useEffect, useState } from 'react';
import { useWorkflow } from '@metabuilder/hooks-data';
import ValidationResults from './ValidationResults';

interface ValidationModalProps {
  workflowId: string;
  onClose: () => void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const ValidationModal: React.FC<
  ValidationModalProps
> = ({ workflowId, onClose }) => {
  const { validate } = useWorkflow();
  const [validation, setValidation] =
    useState<ValidationResult | null>(null);

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

  if (!validation) return null;

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div>
          <h3>Validation Results</h3>
          <button onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line
                x1="18" y1="6" x2="6" y2="18"
                strokeWidth="2"
              />
              <line
                x1="6" y1="6" x2="18" y2="18"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>

        <div>
          <ValidationResults validation={validation} />
        </div>

        <div>
          <button
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
