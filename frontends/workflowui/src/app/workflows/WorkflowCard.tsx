/**
 * WorkflowCard - Single workflow card for the workflows list
 */

'use client';

import React from 'react';
import type { Workflow } from '@metabuilder/hooks';
import styles from '@/../../../scss/atoms/dashboard.module.scss';
import WorkflowCardMedia from './WorkflowCardMedia';
import WorkflowStatusBadge from './WorkflowStatusBadge';
import WorkflowCardActions from './WorkflowCardActions';

interface WorkflowCardProps {
  workflow: Workflow;
  onDelete: (id: string) => void;
}

export default function WorkflowCard({
  workflow,
  onDelete,
}: WorkflowCardProps) {
  return (
    <article className={styles.card}>
      <WorkflowCardMedia
        status={workflow.status}
        icon={workflow.metadata?.labels?.icon}
      />
      <div className={styles.cardContent}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '8px',
          }}
        >
          <h3 className={styles.cardTitle}>
            {workflow.name}
          </h3>
          <WorkflowStatusBadge status={workflow.status} />
        </div>
        <p className={styles.cardDescription}>
          {workflow.description || 'No description'}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--mat-sys-on-surface-variant)',
          }}
        >
          <span>{workflow.nodes?.length || 0} nodes</span>
          <span>•</span>
          <span>v{workflow.version}</span>
        </div>
        <WorkflowCardActions
          workflowId={workflow.id}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
