/**
 * EditorToolbar Component
 * Top toolbar with back button, workflow name, zoom controls, save/run buttons
 */

'use client';

import React from 'react';
import { Button, IconButton, Tooltip } from '../fakemui';
import { BackIcon, ZoomInIcon, ZoomOutIcon, ResetIcon, PlayIcon } from './icons';
import styles from '../../scss/atoms/workflow-editor.module.scss';

export interface EditorToolbarProps {
  workflowName: string;
  onNameChange: (name: string) => void;
  nodeCount: number;
  connectionCount: number;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onBack: () => void;
  onSave: () => void;
  onRun: () => void;
}

export function EditorToolbar({
  workflowName,
  onNameChange,
  nodeCount,
  connectionCount,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onBack,
  onSave,
  onRun,
}: EditorToolbarProps): React.ReactElement {
  return (
    <header className={styles.toolbar}>
      <IconButton onClick={onBack} aria-label="Go back">
        <BackIcon />
      </IconButton>

      <div className={styles.toolbarDivider} />

      <input
        type="text"
        className={styles.propertiesInput}
        style={{ width: 200, margin: 0, padding: '8px 12px' }}
        value={workflowName}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <div className={styles.toolbarSpacer} />

      <span className={styles.toolbarMeta}>
        {nodeCount} nodes | {connectionCount} connections
      </span>

      <div className={styles.toolbarDivider} />

      <div className={styles.zoomControls}>
        <Tooltip title="Zoom out">
          <IconButton onClick={onZoomOut}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <span className={styles.zoomBadge}>{Math.round(zoom * 100)}%</span>
        <Tooltip title="Zoom in">
          <IconButton onClick={onZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset zoom">
          <IconButton onClick={onZoomReset}>
            <ResetIcon />
          </IconButton>
        </Tooltip>
      </div>

      <div className={styles.toolbarDivider} />

      <Button variant="outlined" onClick={onSave}>
        Save
      </Button>

      <Button variant="contained" color="success" onClick={onRun}>
        <PlayIcon />
        <span style={{ marginLeft: 8 }}>Execute</span>
      </Button>
    </header>
  );
}
