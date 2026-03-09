/**
 * Recent Workflows Page - Recently updated workflows
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Button,
  CircularProgress,
  Divider,
} from '@metabuilder/fakemui';
import { Edit, AccessTime, PlayArrow } from '@metabuilder/fakemui';
import { useWorkflows } from '@metabuilder/hooks';
import type { Workflow } from '@metabuilder/hooks';
import styles from '@/../../../scss/atoms/mat-card.module.scss';

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--mat-sys-tertiary)',
  draft: 'var(--mat-sys-secondary)',
  paused: 'var(--mat-sys-error)',
  published: 'var(--mat-sys-primary)',
  deprecated: 'var(--mat-sys-outline)',
};

export default function RecentWorkflowsPage() {
  const { workflows: rawWorkflows, isLoading, listWorkflows } = useWorkflows();
  const workflows = [...(rawWorkflows || [])].sort((a, b) => b.updatedAt - a.updatedAt);

  useEffect(() => {
    listWorkflows({ limit: 20 });
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading && workflows.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} data-testid="recent-page">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Recent Workflows
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your recently updated workflows
        </Typography>
      </Box>

      {workflows.length === 0 ? (
        <Card className={styles['mat-card']}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccessTime sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No recent workflows
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create or edit a workflow to see it here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card className={styles['mat-card']}>
          <List>
            {workflows.map((workflow, index) => (
              <React.Fragment key={workflow.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {workflow.name}
                      </Typography>
                      <Typography
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: STATUS_COLORS[workflow.status] + '20',
                          color: STATUS_COLORS[workflow.status],
                        }}
                      >
                        {workflow.status}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5,
                      }}
                    >
                      {workflow.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Updated {formatTimeAgo(workflow.updatedAt)}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {workflow.nodes?.length || 0} nodes
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        v{workflow.version}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Link href={`/editor/${workflow.id}`}>
                      <Button variant="outlined" size="small" startIcon={<Edit />}>
                        Edit
                      </Button>
                    </Link>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
