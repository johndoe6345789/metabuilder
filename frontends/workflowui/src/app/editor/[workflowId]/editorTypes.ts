/**
 * editorTypes - Shared type definitions for the workflow editor
 */

import type {
  RefObject,
  DragEvent,
  Dispatch,
  SetStateAction,
} from 'react';
import type { NodeType } from '@metabuilder/components/workflow-editor';
import type {
  WorkflowNode,
  WorkflowConnection,
} from '@metabuilder/hooks';

export interface UseCanvasPanInput {
  canvasOffset: { x: number; y: number };
  setCanvasOffset: (v: { x: number; y: number }) => void;
  zoom: number;
  drawingConnection: DrawingConnection | null;
  setDrawingConnection: Dispatch<
    SetStateAction<DrawingConnection | null>
  >;
  canvasRef: RefObject<HTMLDivElement>;
}

export interface DrawingConnection {
  startNodeId: string;
  startPort: string;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
}

export interface EditorCanvasAreaProps {
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
  onCanvasMouseDown: (
    e: React.MouseEvent<HTMLDivElement>
  ) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onNodeSelect: (id: string) => void;
  onNodeDoubleClick: (id: string) => void;
  onNodeDragStart: (
    e: React.MouseEvent,
    id: string,
    offsetX: number,
    offsetY: number
  ) => void;
  onConnectionStart: (
    nodeId: string,
    port: string,
    position: { x: number; y: number }
  ) => void;
  onConnectionEnd: (nodeId: string, port: string) => void;
  getNodeType: (type: string) => NodeType | undefined;
}
