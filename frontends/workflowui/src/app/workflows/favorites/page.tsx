/**
 * Favorite Workflows Page - Starred/bookmarked workflows
 * Currently shows all workflows - favorites feature to be implemented via metadata
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@metabuilder/fakemui';
import { Search, Edit, Delete, Star } from '@metabuilder/fakemui';
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

export default function FavoriteWorkflowsPage() {
  const { workflows, isLoading, listWorkflows, deleteWorkflow } = useWorkflows();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt'>('updatedAt');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    await listWorkflows();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      const success = await deleteWorkflow(id);
      if (success) {
        loadWorkflows();
      }
    }
  };

  const filteredWorkflows = (workflows || [])
    .filter(
      (w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.updatedAt - a.updatedAt;
    });

  const formatLastUpdated = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading && (!workflows || workflows.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} data-testid="favorites-page">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }} data-testid="favorites-title">
          Workflows
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your workflows (favorites feature coming soon)
        </Typography>
      </Box>

      <Card className={styles['mat-card']} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: '1 1 300px', minWidth: 200 }}
              data-testid="search-input"
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value as 'name' | 'updatedAt')}
              >
                <MenuItem value="updatedAt">Last Updated</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {filteredWorkflows.length === 0 ? (
        <Card className={styles['mat-card']}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchQuery ? 'No workflows match your search' : 'No workflows yet'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className={styles['mat-card']}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">{workflow.name}</Typography>
                      <Typography
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: STATUS_COLORS[workflow.status] + '20',
                          color: STATUS_COLORS[workflow.status],
                        }}
                      >
                        {workflow.status}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {workflow.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                      <span>{workflow.nodes?.length || 0} nodes</span>
                      <span>•</span>
                      <span>v{workflow.version}</span>
                      <span>•</span>
                      <span>{formatLastUpdated(workflow.updatedAt)}</span>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Link href={`/editor/${workflow.id}`}>
                      <Button variant="outlined" size="small" startIcon={<Edit />}>
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(workflow.id)}
                      startIcon={<Delete />}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
