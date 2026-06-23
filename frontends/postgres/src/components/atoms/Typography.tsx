'use client';

import { Typography as MuiTypography, type TypographyProps as MuiTypographyProps } from '@metabuilder/components/fakemui';

export type TypographyProps = Omit<MuiTypographyProps, 'children'> & {
  text?: string;
  children?: React.ReactNode;
};

/**
 * Atomic Typography component
 * Wraps Material-UI Typography with text prop from features.json
 */
export default function Typography({ text, children, ...props }: TypographyProps) {
  return <MuiTypography {...props}>{text || children}</MuiTypography>;
}
