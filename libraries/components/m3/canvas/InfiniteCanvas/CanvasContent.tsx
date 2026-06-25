/**
 * CanvasContent Component
 * Renders child content with zoom and pan transforms applied
 * Applies CSS transform for smooth positioning and scaling
 */

import React, { useRef } from 'react';
import { testId } from '@metabuilder/utils/accessibility';

interface CanvasContentProps {
  children: React.ReactNode;
  zoom: number;
  panX: number;
  panY: number;
}

export const CanvasContent = React.forwardRef<HTMLDivElement, CanvasContentProps>(
  ({ children, zoom, panX, panY }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const contentRef = ref || internalRef;

    return (
      <div
        ref={contentRef}

        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
        data-testid={testId.canvasContainer()}
        role="presentation"
      >
        {children}
      </div>
    );
  }
);

CanvasContent.displayName = 'CanvasContent';

export default CanvasContent;
