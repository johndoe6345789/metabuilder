/**
 * WorkflowCardMedia - Colored media banner for a workflow card
 */

'use client';

import React from 'react';
import styles from '/atoms/dashboard.module.scss';

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--mat-sys-tertiary)',
  draft: 'var(--mat-sys-secondary)',
  paused: 'var(--mat-sys-error)',
  published: 'var(--mat-sys-primary)',
  deprecated: 'var(--mat-sys-outline)',
};

interface WorkflowCardMediaProps {
  status: string;
  icon?: string;
}

export default function WorkflowCardMedia({
  status,
  icon,
}: WorkflowCardMediaProps) {
  return (
    <div
      className={styles.cardMedia}
      style={{
        backgroundColor:
          STATUS_COLORS[status] || 'var(--mat-sys-primary)',
      }}
    >
      <div style={{ fontSize: '32px', color: 'white' }}>
        {icon || '⚙️'}
      </div>
    </div>
  );
}
