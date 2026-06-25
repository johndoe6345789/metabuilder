/**
 * Recent Workflows Page - Recently updated workflows
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  CircularProgress,
  Divider,
} from '@metabuilder/m3';
import { AccessTime } from '@metabuilder/m3';
import styles from '@scss/atoms/mat-card.module.scss';
import { useRecentWorkflows } from './hooks/useRecentWorkflows';
import RecentWorkflowItem from './RecentWorkflowItem';

export default function RecentWorkflowsPage() {
  const { workflows, isLoading, formatTimeAgo } =
    useRecentWorkflows();

  if (isLoading && workflows.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
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
              <AccessTime
                sx={{
                  fontSize: 64,
                  color: 'text.disabled',
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
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
                <RecentWorkflowItem
                  workflow={workflow}
                  formatTimeAgo={formatTimeAgo}
                />
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
