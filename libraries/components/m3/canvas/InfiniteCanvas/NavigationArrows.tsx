/**
 * NavigationArrows Component
 * Four directional arrow buttons for panning canvas
 * Positioned: top, bottom, left, right edges
 */

import React from 'react';
import { testId, aria } from '@metabuilder/utils/accessibility';

interface NavigationArrowsProps {
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({ onPan }) => {
  return (
    <>
      <button
        className={""}
        onClick={() => onPan('up')}
        title="Pan up (or use arrow keys)"
        aria-label="Pan up"
        data-testid={testId.button('pan-up')}
      >
        ▲
      </button>

      <button
        className={""}
        onClick={() => onPan('down')}
        title="Pan down (or use arrow keys)"
        aria-label="Pan down"
        data-testid={testId.button('pan-down')}
      >
        ▼
      </button>

      <button
        className={""}
        onClick={() => onPan('left')}
        title="Pan left (or use arrow keys)"
        aria-label="Pan left"
        data-testid={testId.button('pan-left')}
      >
        ◄
      </button>

      <button
        className={""}
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
