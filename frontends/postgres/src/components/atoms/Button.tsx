'use client';

import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@metabuilder/components/fakemui';
import * as Icons from '@metabuilder/components/fakemui';

export type ButtonProps = Omit<MuiButtonProps, 'startIcon' | 'endIcon'> & {
  text?: string;
  startIcon?: keyof typeof Icons;
  endIcon?: keyof typeof Icons;
};

/**
 * Atomic Button component
 * Wraps Material-UI Button with icon support from features.json
 */
export default function Button({ 
  text, 
  children,
  startIcon, 
  endIcon,
  ...props 
}: ButtonProps) {
  const StartIconComponent = startIcon ? Icons[startIcon] : null;
  const EndIconComponent = endIcon ? Icons[endIcon] : null;

  return (
    <MuiButton
      {...props}
      startIcon={StartIconComponent ? <StartIconComponent /> : undefined}
      endIcon={EndIconComponent ? <EndIconComponent /> : undefined}
    >
      {text || children}
    </MuiButton>
  );
}
