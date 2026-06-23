/**
 * useDrawingConnection - State and updater for live connection drawing
 */

'use client';

import { useState } from 'react';
import type { Position } from '@/../../../components/workflow-editor';

export interface DrawingConnection {
  sourceNodeId: string;
  sourceOutput: string;
  startPosition: Position;
  currentPosition: Position;
}

export function useDrawingConnection() {
  const [drawingConnection, setDrawingConnection] =
    useState<DrawingConnection | null>(null);

  return { drawingConnection, setDrawingConnection };
}
