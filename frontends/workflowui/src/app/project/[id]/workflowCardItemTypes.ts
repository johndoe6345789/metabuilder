/**
 * workflowCardItemTypes - Types for WorkflowCardItem
 */

export interface WorkflowCardItemProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    status: string;
    nodeCount: number;
    lastModified: number;
  };
  onCardClick: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onFavorite: () => void;
  getStatusColor: (s: string) => string;
  getStatusBorderColor: (s: string) => string;
  formatDate: (ts: number) => string;
}
