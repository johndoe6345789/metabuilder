/**
 * WorkflowExecutorSettings - Executor and timeout settings for workflows
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Divider,
} from '@metabuilder/m3';
import PREFS from './settings-options.json';

interface WorkflowExecutorSettingsProps {
  defaultExecutor: string;
  workflowTimeout: string;
  setDefaultExecutor: (v: string) => void;
  setWorkflowTimeout: (v: string) => void;
}

export default function WorkflowExecutorSettings({
  defaultExecutor,
  workflowTimeout,
  setDefaultExecutor,
  setWorkflowTimeout,
}: WorkflowExecutorSettingsProps) {
  return (
    <>
      <Divider />
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Default Executor
        </Typography>
        <Select
          fullWidth
          value={defaultExecutor}
          onChange={(e) => setDefaultExecutor(e.target.value)}
          data-testid="default-executor-select"
        >
          {PREFS.executors.map((ex) => (
            <MenuItem key={ex.value} value={ex.value}>
              {ex.label}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary">
          Default language for new workflow nodes
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Workflow Timeout (seconds)
        </Typography>
        <TextField
          fullWidth
          type="number"
          value={workflowTimeout}
          onChange={(e) => setWorkflowTimeout(e.target.value)}
          helperText="Maximum execution time for workflows"
          inputProps={{ min: 30, max: 3600 }}
          data-testid="workflow-timeout-input"
        />
      </Box>
    </>
  );
}
