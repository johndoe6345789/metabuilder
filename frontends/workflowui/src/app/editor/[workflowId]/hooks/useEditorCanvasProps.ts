/**
 * useEditorCanvasProps - Collects EditorCanvasArea prop bundle
 */

'use client';

import { DragEvent, RefObject } from 'react';
import type { NodeType } from '@/../../../../../components/workflow-editor';
import type { WorkflowNode, WorkflowConnection } from '@metabuilder/hooks';
import type { DrawingConnection } from './useDrawingConnection';

interface EditorCanvasPropsInput {
  canvasRef: RefObject<HTMLDivElement>;
  canvasOffset: { x: number; y: number };
  zoom: number;
  isPanning: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  drawingConnection: DrawingConnection | null;
  selectedNodeId: string | null;
  onCanvasDrop: (e: DragEvent<HTMLDivElement>) => void;
  onCanvasDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onCanvasMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onNodeSelect: (id: string) => void;
  onNodeDoubleClick: (id: string) => void;
  onNodeDragStart: (
    e: React.MouseEvent, id: string,
    ox: number, oy: number
  ) => void;
  onConnectionStart: (
    nodeId: string, port: string,
    pos: { x: number; y: number }
  ) => void;
  onConnectionEnd: (nodeId: string, port: string) => void;
  getNodeType: (t: string) => NodeType | undefined;
}

export function useEditorCanvasProps(
  input: EditorCanvasPropsInput
) {
  return input;
}
