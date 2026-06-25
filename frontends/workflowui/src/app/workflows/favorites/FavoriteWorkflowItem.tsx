/**
 * FavoriteWorkflowItem - Single workflow card in favorites list
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
} from '@metabuilder/m3';
import styles from '/atoms/mat-card.module.scss';
import FavoriteWorkflowActions from './FavoriteWorkflowActions';
import FavoriteWorkflowInfo from './FavoriteWorkflowInfo';

interface FavoriteWorkflowItemProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    status: string;
    version: string;
    updatedAt: number;
    nodes?: unknown[];
  };
  onDelete: (id: string) => void;
  formatLastUpdated: (ts: number) => string;
}

export default function FavoriteWorkflowItem({
  workflow,
  onDelete,
  formatLastUpdated,
}: FavoriteWorkflowItemProps) {
  return (
    <Card className={styles['mat-card']}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
          }}
        >
          <FavoriteWorkflowInfo
            name={workflow.name}
            status={workflow.status}
            description={workflow.description}
            version={workflow.version}
            nodeCount={workflow.nodes?.length || 0}
            updatedAt={workflow.updatedAt}
            formatLastUpdated={formatLastUpdated}
          />
          <FavoriteWorkflowActions
            workflowId={workflow.id}
            onDelete={onDelete}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
