'use client';

import { SvgIconProps } from '@mui/material';
import * as Icons from '@mui/icons-material';

export type IconProps = SvgIconProps & {
  name: keyof typeof Icons;
};

/**
 * Atomic Icon component
 * Renders Material-UI icons by name from features.json
 */
export default function Icon({ name, ...props }: IconProps) {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Material Icons`);
    return null;
  }

  return <IconComponent {...props} />;
}
