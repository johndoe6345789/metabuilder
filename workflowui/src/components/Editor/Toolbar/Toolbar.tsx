/**
 * Toolbar Component
 * Main toolbar composition component combining execution and view controls
 */

import React, { useState } from 'react';
import { ExecutionToolbar } from './ExecutionToolbar';
import { ViewToolbar } from './ViewToolbar';
import { ValidationModal } from './ValidationModal';
import styles from '../Toolbar.module.scss';

interface ToolbarProps {
  workflowId: string;
  onValidate?: () => Promise<boolean>;
}

export const Toolbar: React.FC<ToolbarProps> = ({ workflowId, onValidate }) => {
  const [showValidation, setShowValidation] = useState(false);

  return (
    <div className={styles.toolbar}>
      <ExecutionToolbar
        workflowId={workflowId}
        onValidationShow={setShowValidation}
      />

      <ViewToolbar onMenuOpen={() => {}} />

      {showValidation && (
        <ValidationModal
          workflowId={workflowId}
          onClose={() => setShowValidation(false)}
        />
      )}
    </div>
  );
};

export default Toolbar;
