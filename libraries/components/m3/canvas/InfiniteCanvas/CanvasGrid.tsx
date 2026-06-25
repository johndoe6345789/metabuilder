/**
 * CanvasGrid Component
 * Renders the grid pattern background
 * Uses SVG for crisp grid dots aligned with pan offset
 */

import React from 'react';
import { testId } from '@metabuilder/utils/accessibility';

interface CanvasGridProps {
  snapSize: number;
  gridOffset: { x: number; y: number };
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ snapSize, gridOffset }) => {
  return (
    <div  data-testid={testId.canvasGrid()} aria-hidden="true">
      <svg

        width={snapSize}
        height={snapSize}
        style={{
          transform: `translate(${gridOffset.x}px, ${gridOffset.y}px)`
        }}
      >
        <circle
          cx={snapSize / 2}
          cy={snapSize / 2}
          r="1"
          fill="currentColor"
          opacity="0.1"
        />
      </svg>
    </div>
  );
};

export default CanvasGrid;
