/**
 * workflowCardTypes - Types and memo comparator for WorkflowCard
 */

import { ProjectCanvasItem } from '../../types/project';

export interface WorkflowCardProps {
  item: ProjectCanvasItem;
  workflow: any;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdatePosition: (
    id: string, x: number, y: number
  ) => void;
  onUpdateSize: (
    id: string, width: number, height: number
  ) => void;
  onDelete: (id: string) => void;
  onOpen: (workflowId: string) => void;
  zoom: number;
  snap_to_grid: (
    pos: { x: number; y: number }
  ) => { x: number; y: number };
}

export function areWorkflowCardPropsEqual(
  prev: WorkflowCardProps,
  next: WorkflowCardProps
): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.item.position.x === next.item.position.x &&
    prev.item.position.y === next.item.position.y &&
    prev.item.size.width === next.item.size.width &&
    prev.item.size.height === next.item.size.height &&
    prev.isSelected === next.isSelected &&
    prev.item.zIndex === next.item.zIndex
  );
}
