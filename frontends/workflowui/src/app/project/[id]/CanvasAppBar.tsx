/**
 * CanvasAppBar - Top app bar for project canvas
 */

'use client';

import React from 'react';
import {
  Box as BoxComp,
  Stack as StackComp,
  AppBar as AppBarComp,
  Toolbar as ToolbarComp,
  Typography as TypographyComp,
  Button as ButtonComp,
  Tooltip as TooltipComp,
} from '@metabuilder/fakemui';
import { Plus, Breadcrumbs } from '@metabuilder/fakemui';

const Box = BoxComp as any;
const Stack = StackComp as any;
const AppBar = AppBarComp as any;
const Toolbar = ToolbarComp as any;
const Typography = TypographyComp as any;
const Button = ButtonComp as any;
const Tooltip = TooltipComp as any;

interface CanvasAppBarProps {
  projectId: string;
  projectName: string | undefined;
  workflowCount: number;
}

export default function CanvasAppBar({
  projectId,
  projectName,
  workflowCount,
}: CanvasAppBarProps) {
  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs
            items={[
              { label: '🏠 Workspaces', href: '/' },
              {
                label: projectName || 'Project',
                href: `/project/${projectId}`,
              },
            ]}
          />
          <Typography
            variant="h5"
            sx={{ mt: 1, mb: 0.5, fontWeight: 600 }}
          >
            {projectName || 'Project Canvas'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {workflowCount} workflows • Project ID: {projectId}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Add Workflow">
            <Button
              variant="contained"
              startIcon={<Plus />}
              size="small"
            >
              Add
            </Button>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
