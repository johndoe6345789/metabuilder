/**
 * Icon registry for the component tree renderer.
 * Explicit imports prevent tree-shaking of icons used in features.json.
 */

import React from 'react';
import * as Icons from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TableChartIcon from '@mui/icons-material/TableChart';

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
