/**
 * useEditorToolbarActions - Toolbar zoom and navigation actions
 */

'use client';

import type { Workflow } from '@metabuilder/components/workflow-editor';

interface EditorToolbarActionsParams {
  router: { back: () => void };
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  handleSave: () => void;
  handleRun: () => void;
}

export function useEditorToolbarActions({
  router,
  setWorkflow,
  setZoom,
  setCanvasOffset,
  handleSave,
  handleRun,
}: EditorToolbarActionsParams) {
  const onNameChange = (name: string) => {
    setWorkflow((prev) => ({ ...prev, name }));
  };

  const onZoomIn = () => {
    setZoom((prev) => Math.min(2, prev + 0.25));
  };

  const onZoomOut = () => {
    setZoom((prev) => Math.max(0.25, prev - 0.25));
  };

  const onZoomReset = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const onBack = () => router.back();

  return {
    onNameChange,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onBack,
    onSave: handleSave,
    onRun: handleRun,
  };
}
