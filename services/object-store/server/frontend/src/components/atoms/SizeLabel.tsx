'use client';

import { Typography } from '@shared/m3';
import { formatBytes } from '@/utils';

/** @brief Props for SizeLabel atom. */
export interface SizeLabelProps {
  /** Size in bytes. */
  bytes: number;
  /** Test ID for automation. */
  testId?: string;
}

/**
 * @brief Display human-readable file size.
 * @param props - SizeLabel properties.
 */
export default function SizeLabel({
  bytes,
  testId = 'size-label',
}: SizeLabelProps) {
  return (
    <Typography
      variant="body2"
      data-testid={testId}
      aria-label={`Size: ${formatBytes(bytes)}`}
    >
      {formatBytes(bytes)}
    </Typography>
  );
}
