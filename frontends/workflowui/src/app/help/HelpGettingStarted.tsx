/**
 * HelpGettingStarted - Getting started guide card
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
} from '@metabuilder/fakemui';

export default function HelpGettingStarted() {
  return (
    <Box sx={{ mb: 4 }}>
      <Card data-testid="getting-started-card">
        <CardHeader title="Getting Started" />
        <CardContent>
          <Typography
            variant="body2"
            color="text.secondary"
            paragraph
          >
            New to MetaBuilder? Follow these steps:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Create a workspace:</strong> Click &quot;New
              Workspace&quot; on the dashboard.
            </Typography>
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Start a new workflow:</strong> Click &quot;New
              Workflow&quot; to open the visual editor.
            </Typography>
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Add nodes:</strong> Drag nodes from the
              palette onto the canvas.
            </Typography>
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Connect nodes:</strong> Drag from output to
              input ports.
            </Typography>
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Configure and run:</strong> Click nodes to
              configure, then hit play.
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              data-testid="view-tutorials-btn"
            >
              View Video Tutorials
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
