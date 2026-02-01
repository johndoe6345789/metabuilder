/**
 * Dashboard / Home Page
 * Workspace selector and recent workflows
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  Chip,
  Stack,
  Paper,
  Plus,
} from '@metabuilder/fakemui';
import { useDashboardLogic } from '../hooks';
import { Breadcrumbs } from '../components/Navigation/Breadcrumbs';

export default function Dashboard() {
  const {
    isLoading,
    showCreateForm,
    newWorkspaceName,
    workspaces,
    setShowCreateForm,
    setNewWorkspaceName,
    handleCreateWorkspace,
    handleWorkspaceClick,
    resetWorkspaceForm
  } = useDashboardLogic();

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs items={[{ label: '🏠 Workspaces', href: '/' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, mt: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Workspaces
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize your projects and workflows
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus />}
          onClick={() => setShowCreateForm(true)}
        >
          New Workspace
        </Button>
      </Box>

      <Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading workspaces...</Typography>
          </Box>
        ) : (
          <>
            {/* Create Workspace Form */}
            {showCreateForm && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <form onSubmit={handleCreateWorkspace}>
                  <Typography variant="h6" gutterBottom>Create New Workspace</Typography>
                  <TextField
                    fullWidth
                    placeholder="Workspace name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    autoFocus
                    sx={{ mb: 2 }}
                  />
                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!newWorkspaceName.trim()}
                    >
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={resetWorkspaceForm}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </form>
              </Paper>
            )}

            {/* Workspaces Grid */}
            {workspaces.length === 0 && !showCreateForm ? (
              <EmptyState onCreateWorkspace={() => setShowCreateForm(true)} />
            ) : (
              <Grid container spacing={3}>
                {workspaces.map(workspace => (
                  <Grid item xs={12} sm={6} md={4} key={workspace.id}>
                    <Card
                      sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                      onClick={() => handleWorkspaceClick(workspace.id)}
                    >
                      <Box
                        sx={{
                          height: 80,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          backgroundColor: workspace.color || 'primary.main',
                        }}
                      >
                        {workspace.icon || '📁'}
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{workspace.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {workspace.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Created {new Date(workspace.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

interface EmptyStateProps {
  onCreateWorkspace: () => void;
}

function EmptyState({ onCreateWorkspace }: EmptyStateProps) {
  return (
    <Paper sx={{ textAlign: 'center', py: 8, px: 4 }}>
      <Box sx={{ color: 'text.secondary', mb: 2 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeWidth="2" />
        </svg>
      </Box>
      <Typography variant="h5" gutterBottom>No workspaces yet</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create your first workspace to organize your projects
      </Typography>
      <Button variant="contained" size="large" onClick={onCreateWorkspace}>
        Create Your First Workspace
      </Button>
    </Paper>
  );
}

interface WorkflowGridProps {
  workflows: any[];
}

function WorkflowGrid({ workflows }: WorkflowGridProps) {
  return (
    <Grid container spacing={3}>
      {workflows.map((workflow) => (
        <Grid item xs={12} sm={6} md={4} key={workflow.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">{workflow.name}</Typography>
                <Chip label={`${workflow.nodes?.length || 0} nodes`} size="small" color="info" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {workflow.description || 'No description'}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Updated {new Date(workflow.updatedAt).toLocaleDateString()}
              </Typography>
              <Button
                component={Link}
                href={`/editor/${workflow.id}` as any}
                variant="contained"
                size="small"
              >
                Edit
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
