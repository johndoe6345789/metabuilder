/**
 * WorkspaceCard - Single workspace card on the dashboard
 */

'use client';

import React from 'react';
import styles from '@scss/atoms/dashboard.module.scss';

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    createdAt: string;
  };
  onClick: () => void;
}

export default function WorkspaceCard({
  workspace,
  onClick,
}: WorkspaceCardProps) {
  const initials = workspace.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={styles.card}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      tabIndex={0}
      role="button"
      aria-label={`Open ${workspace.name} workspace`}
    >
      <div
        className={styles.cardMedia}
        style={{
          backgroundColor:
            workspace.color || 'var(--mat-sys-primary)',
        }}
      >
        <span className={styles.cardInitials}>{initials}</span>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{workspace.name}</h3>
        <p className={styles.cardDescription}>
          {workspace.description || 'No description'}
        </p>
        <span className={styles.cardMeta}>
          Created{' '}
          {new Date(workspace.createdAt).toLocaleDateString()}
        </span>
      </div>
    </article>
  );
}
