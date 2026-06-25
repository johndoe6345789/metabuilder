/**
 * PaletteNode Component
 * Draggable node item in the palette sidebar
 */

'use client';

import React, { DragEvent } from 'react';
import type { NodeType } from './types';
import { getNodeIcon } from './icons';
import styles from '../../scss/atoms/workflow-editor.module.scss';

export interface PaletteNodeProps {
  nodeType: NodeType;
  onDragStart: (e: DragEvent, nodeType: NodeType) => void;
}

export function PaletteNode({ nodeType, onDragStart }: PaletteNodeProps): React.ReactElement {
  return (
    <div
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => onDragStart(e, nodeType)}
      className={styles.paletteNode}
    >
      <div className={styles.paletteNodeIcon} style={{ backgroundColor: nodeType.color }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d={getNodeIcon(nodeType.icon)} />
        </svg>
      </div>
      <div className={styles.paletteNodeInfo}>
        <p className={styles.paletteNodeName}>{nodeType.name}</p>
        <p className={styles.paletteNodeDesc}>{nodeType.description}</p>
      </div>
    </div>
  );
}
