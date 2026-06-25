/**
 * Icon registry for the component tree renderer.
 * Explicit imports prevent tree-shaking of icons used in features.json.
 */

import React from 'react';
import * as Icons from '@metabuilder/components/m3';
import { Add as AddIcon, Build as BoltIcon, Delete as DeleteIcon, Download as DownloadIcon, Edit as EditIcon, Play as PlayArrowIcon, Table as TableChartIcon } from '@metabuilder/components/m3';

export const iconOverrides: Record<string, React.ComponentType<any>>
  = {
    TableChart: TableChartIcon,
    Bolt: BoltIcon,
    Delete: DeleteIcon,
    Add: AddIcon,
    Edit: EditIcon,
    PlayArrow: PlayArrowIcon,
    Download: DownloadIcon,
  };

export function resolveIcon(
  iconName: string,
  props?: Record<string, any>,
): React.ReactElement | null {
  const IconComponent
    = iconOverrides[iconName] || (Icons as any)[iconName];
  if (!IconComponent) return null;
  return React.createElement(IconComponent, props);
}
