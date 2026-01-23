/**
 * PanHint Component
 * Shows hint text at bottom center when user can pan
 * Explains shift+drag interaction
 */

import React from 'react';
import styles from '../InfiniteCanvas.module.scss';
import { aria } from '../../../utils/accessibility';

export const PanHint: React.FC = () => {
  return (
    <div
      className={styles.panHint}
      role="tooltip"
      aria-label="Pan canvas hint: Hold Shift plus Drag to pan"
      aria-live="polite"
    >
      Hold <kbd>Shift</kbd> + Drag to pan
    </div>
  );
};

export default PanHint;
