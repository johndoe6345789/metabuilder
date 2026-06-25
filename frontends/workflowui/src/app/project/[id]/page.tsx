/**
 * Project Canvas Page
 * Displays an infinite canvas with workflow cards
 */

'use client';

import React from 'react';
import {
  Box as BoxComp,
  Grid as GridComp,
} from '@metabuilder/m3';
import { useProjectCanvasPage } from './hooks/useProjectCanvas';
import CanvasAppBar from './CanvasAppBar';
import WorkflowCardItem from './WorkflowCardItem';
import CanvasZoomControls from './CanvasZoomControls';
import CanvasViewport from './CanvasViewport';
import CanvasLoadingState from './CanvasLoadingState';

const Box = BoxComp as any;
const Grid = GridComp as any;

export default function ProjectCanvasPage() {
  const {
    projectId,
    currentProject,
    workflows,
    workflowsLoading,
    canvasZoom,
    setCanvasZoom,
    canvasPan,
    setCanvasPan,
    handleCardClick,
    handleCardDragStart,
    handleCanvasDragOver,
    handleCanvasDrop,
    formatDate,
    getStatusColor,
    getStatusBorderColor,
    success,
  } = useProjectCanvasPage();

  if (workflowsLoading) return <CanvasLoadingState />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <CanvasAppBar
        projectId={projectId}
        projectName={currentProject?.name}
        workflowCount={workflows.length}
      />

      <CanvasViewport
        canvasZoom={canvasZoom}
        canvasPan={canvasPan}
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
      >
        <Grid
          container
          spacing={3}
          sx={{ p: 3, maxWidth: 'none' }}
        >
          {workflows.map((workflow) => (
            <WorkflowCardItem
              key={workflow.id}
              workflow={workflow}
              onCardClick={handleCardClick}
              onDragStart={handleCardDragStart}
              onFavorite={() => success('Added to favorites')}
              getStatusColor={getStatusColor}
              getStatusBorderColor={getStatusBorderColor}
              formatDate={formatDate}
            />
          ))}
        </Grid>
      </CanvasViewport>

      <CanvasZoomControls
        onZoomIn={() =>
          setCanvasZoom((z) => Math.min(z + 0.1, 2))
        }
        onZoomOut={() =>
          setCanvasZoom((z) => Math.max(z - 0.1, 0.5))
        }
        onReset={() => {
          setCanvasZoom(1);
          setCanvasPan({ x: 0, y: 0 });
        }}
      />
    </Box>
  );
}
