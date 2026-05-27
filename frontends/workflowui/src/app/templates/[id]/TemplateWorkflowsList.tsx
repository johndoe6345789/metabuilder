/**
 * TemplateWorkflowsList - List of workflows included in a template
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/template-detail.module.scss';

interface WorkflowEntry {
  id: string;
  name: string;
  description: string;
}

interface TemplateWorkflowsListProps {
  workflows: WorkflowEntry[];
}

export default function TemplateWorkflowsList({
  workflows,
}: TemplateWorkflowsListProps) {
  return (
    <Box component="section" className={styles.section}>
      <Typography variant="h5">
        Included Workflows ({workflows.length})
      </Typography>
      <Box className={styles.workflowsList}>
        {workflows.map((workflow) => (
          <Box
            key={workflow.id}
            className={styles.workflowItem}
          >
            <Typography variant="h6">
              {workflow.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {workflow.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
