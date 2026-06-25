'use client';

import type { IconProps as SvgIconProps } from '@metabuilder/components/m3';
import * as Icons from '@metabuilder/components/m3';

export type IconProps = SvgIconProps & {
  name: keyof typeof Icons;
};

/**
 * Atomic Icon component
 * Renders m3 icons by name from features.json
 */
export default function Icon({ name, ...props }: IconProps) {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in m3 icons`);
    return null;
  }

  return <IconComponent {...props} />;
}
