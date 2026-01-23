/**
 * CanvasContent Component
 * Renders child content with zoom and pan transforms applied
 * Applies CSS transform for smooth positioning and scaling
 */

import React, { useRef } from 'react';
import styles from '../InfiniteCanvas.module.scss';

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
        className={styles.content}
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {children}
      </div>
    );
  }
);

CanvasContent.displayName = 'CanvasContent';

export default CanvasContent;
