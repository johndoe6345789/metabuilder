'use client';

import type { IconProps as SvgIconProps } from '@metabuilder/components/fakemui';
import * as Icons from '@metabuilder/components/fakemui';

export type IconProps = SvgIconProps & {
  name: keyof typeof Icons;
};

/**
 * Atomic Icon component
 * Renders fakemui icons by name from features.json
 */
export default function Icon({ name, ...props }: IconProps) {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in fakemui icons`);
    return null;
  }

  return <IconComponent {...props} />;
}
