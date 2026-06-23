'use client';

import { IconButton as MuiIconButton, type IconButtonProps as MuiIconButtonProps } from '@metabuilder/components/fakemui';
import * as Icons from '@metabuilder/components/fakemui';

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
