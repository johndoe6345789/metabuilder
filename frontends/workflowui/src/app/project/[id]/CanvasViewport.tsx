/**
 * CanvasViewport - The scrollable/zoomable canvas area
 */

'use client';

import React from 'react';
import { Box as BoxComp } from '@metabuilder/fakemui';

const Box = BoxComp as any;

interface CanvasViewportProps {
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  children: React.ReactNode;
}

export default function CanvasViewport({
  canvasZoom,
  canvasPan,
  onDragOver,
  onDrop,
  children,
}: CanvasViewportProps) {
  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage:
          'linear-gradient(90deg, ' +
          'var(--md-sys-color-outline-variant) 1px, ' +
          'transparent 1px), ' +
          'linear-gradient(' +
          'var(--md-sys-color-outline-variant) 1px, ' +
          'transparent 1px)',
        backgroundSize: '20px 20px',
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform:
            `translate(${canvasPan.x}px, ${canvasPan.y}px)` +
            ` scale(${canvasZoom})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
