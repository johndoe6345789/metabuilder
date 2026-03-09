/**
 * PanHint Component
 * Shows hint text at bottom center when user can pan
 * Explains shift+drag interaction
 */

import React from 'react';
import styles from '../InfiniteCanvas.module.scss';

export const PanHint: React.FC = () => {
  return (
    <div className={styles.panHint}>
      Hold <kbd>Shift</kbd> + Drag to pan
    </div>
  );
};

export default PanHint;
