'use client';

import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps } from '@mui/material';
import * as Icons from '@mui/icons-material';

export type IconButtonProps = Omit<MuiIconButtonProps, 'children'> & {
  icon: keyof typeof Icons;
};

/**
 * Atomic IconButton component
 * Wraps Material-UI IconButton with icon name from features.json
 */
export default function IconButton({ icon, ...props }: IconButtonProps) {
  const IconComponent = Icons[icon];

  if (!IconComponent) {
    console.warn(`Icon "${icon}" not found in Material Icons`);
    return null;
  }

  return (
    <MuiIconButton {...props}>
      <IconComponent />
    </MuiIconButton>
  );
}
