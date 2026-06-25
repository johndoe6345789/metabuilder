/**
 * WorkflowStatusBadge - Colored status label for workflow cards
 */

'use client';

import React from 'react';

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--mat-sys-tertiary)',
  draft: 'var(--mat-sys-secondary)',
  paused: 'var(--mat-sys-error)',
  published: 'var(--mat-sys-primary)',
  deprecated: 'var(--mat-sys-outline)',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  paused: 'Paused',
  published: 'Published',
  deprecated: 'Deprecated',
};

interface WorkflowStatusBadgeProps {
  status: string;
}

export default function WorkflowStatusBadge({
  status,
}: WorkflowStatusBadgeProps) {
  const color = STATUS_COLORS[status];
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: color ? color + '20' : undefined,
        color,
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
