/**
 * NavigationArrows Component
 * Four directional arrow buttons for panning canvas
 * Positioned: top, bottom, left, right edges
 */

import React from 'react';
import styles from '../InfiniteCanvas.module.scss';

interface NavigationArrowsProps {
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({ onPan }) => {
  return (
    <>
      <button
        className={`${styles.navArrow} ${styles.navTop}`}
        onClick={() => onPan('up')}
        title="Pan up"
        aria-label="Pan up"
      >
        ▲
      </button>

      <button
        className={`${styles.navArrow} ${styles.navBottom}`}
        onClick={() => onPan('down')}
        title="Pan down"
        aria-label="Pan down"
      >
        ▼
      </button>

      <button
        className={`${styles.navArrow} ${styles.navLeft}`}
        onClick={() => onPan('left')}
        title="Pan left"
        aria-label="Pan left"
      >
        ◄
      </button>

      <button
        className={`${styles.navArrow} ${styles.navRight}`}
        onClick={() => onPan('right')}
        title="Pan right"
        aria-label="Pan right"
      >
        ►
      </button>
    </>
  );
};

export default NavigationArrows;
