'use client';

import { Chip } from '@shared/m3';

/** @brief Props for StatusChip atom. */
export interface StatusChipProps {
  /** Status level determining color. */
  status:
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
  /** Label text. */
  label: string;
  /** Test ID for automation. */
  testId?: string;
}

/**
 * @brief Colored status indicator chip.
 * @param props - StatusChip properties.
 */
export default function StatusChip({
  status,
  label,
  testId = 'status-chip',
}: StatusChipProps) {
  return (
    <Chip
      size="small"
      color={status}
      label={label}
      data-testid={testId}
      aria-label={label}
    />
  );
}
