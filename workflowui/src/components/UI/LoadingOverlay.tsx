/**
 * Loading Overlay Component
 * Full-screen overlay shown during loading operations
 */

import React from 'react';
import { useUI } from '../../hooks';
import styles from './LoadingOverlay.module.scss';

export const LoadingOverlay: React.FC = () => {
  const { loading, loadingMessage } = useUI();

  if (!loading) {
    return null;
  }

  return (
    <div className={styles.overlay} role="progressbar" aria-busy="true">
      <div className={styles.content}>
        <div className={styles.spinner}>
          <div className={styles.spinnerCircle}></div>
        </div>
        {loadingMessage && <p className={styles.message}>{loadingMessage}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
