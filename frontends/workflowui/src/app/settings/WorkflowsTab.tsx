/**
 * WorkflowsTab - Workflow-specific settings panel
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
} from '@metabuilder/fakemui';
import WorkflowExecutorSettings from './WorkflowExecutorSettings';

interface WorkflowsTabProps {
  autoSave: boolean;
  setAutoSave: (v: boolean) => void;
  defaultExecutor: string;
  setDefaultExecutor: (v: string) => void;
  workflowTimeout: string;
  setWorkflowTimeout: (v: string) => void;
  onSave: () => void;
}

export default function WorkflowsTab({
  autoSave,
  setAutoSave,
  defaultExecutor,
  setDefaultExecutor,
  workflowTimeout,
  setWorkflowTimeout,
  onSave,
}: WorkflowsTabProps) {
  return (
    <Card data-testid="workflows-card">
      <CardHeader title="Workflow Settings" />
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={autoSave}
                  onChange={(e) =>
                    setAutoSave(e.target.checked)
                  }
                  data-testid="auto-save-switch"
                />
              }
              label="Auto-save workflows"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', ml: 4 }}
            >
              Automatically save workflow changes every 30
              seconds
            </Typography>
          </Box>

          <WorkflowExecutorSettings
            defaultExecutor={defaultExecutor}
            workflowTimeout={workflowTimeout}
            setDefaultExecutor={setDefaultExecutor}
            setWorkflowTimeout={setWorkflowTimeout}
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          onClick={onSave}
          data-testid="save-workflow-settings-btn"
        >
          Save Settings
        </Button>
      </CardActions>
    </Card>
  );
}
