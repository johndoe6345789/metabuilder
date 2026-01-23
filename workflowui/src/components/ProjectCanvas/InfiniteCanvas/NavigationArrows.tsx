/**
 * NavigationArrows Component
 * Four directional arrow buttons for panning canvas
 * Positioned: top, bottom, left, right edges
 */

import React from 'react';
import styles from '../InfiniteCanvas.module.scss';
import { testId, aria } from '../../../utils/accessibility';

interface NavigationArrowsProps {
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({ onPan }) => {
  return (
    <>
      <button
        className={`${styles.navArrow} ${styles.navTop}`}
        onClick={() => onPan('up')}
        title="Pan up (or use arrow keys)"
        aria-label="Pan up"
        data-testid={testId.button('pan-up')}
      >
        ▲
      </button>

      <button
        className={`${styles.navArrow} ${styles.navBottom}`}
        onClick={() => onPan('down')}
        title="Pan down (or use arrow keys)"
        aria-label="Pan down"
        data-testid={testId.button('pan-down')}
      >
        ▼
      </button>

      <button
        className={`${styles.navArrow} ${styles.navLeft}`}
        onClick={() => onPan('left')}
        title="Pan left (or use arrow keys)"
        aria-label="Pan left"
        data-testid={testId.button('pan-left')}
      >
        ◄
      </button>

      <button
        className={`${styles.navArrow} ${styles.navRight}`}
        onClick={() => onPan('right')}
        title="Pan right (or use arrow keys)"
        aria-label="Pan right"
        data-testid={testId.button('pan-right')}
      >
        ►
      </button>
    </>
  );
};

export default NavigationArrows;
