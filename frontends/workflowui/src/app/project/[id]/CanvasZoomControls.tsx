/**
 * CanvasZoomControls - Floating zoom controls for project canvas
 */

'use client';

import React from 'react';
import {
  Box as BoxComp,
  Paper as PaperComp,
  IconButton as IconButtonComp,
  Tooltip as TooltipComp,
} from '@metabuilder/m3';
import { ArrowUp, ArrowDown } from '@metabuilder/m3';

const Box = BoxComp as any;
const Paper = PaperComp as any;
const IconButton = IconButtonComp as any;
const Tooltip = TooltipComp as any;

interface CanvasZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function CanvasZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: CanvasZoomControlsProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1,
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton
            size="small"
            onClick={onZoomIn}
            variant="outlined"
          >
            <ArrowUp />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Zoom">
          <IconButton
            size="small"
            onClick={onReset}
            variant="outlined"
          >
            ↺
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton
            size="small"
            onClick={onZoomOut}
            variant="outlined"
          >
            <ArrowDown />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
}
