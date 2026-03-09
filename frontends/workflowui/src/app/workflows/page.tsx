/**
 * Workflows Page - All workflows list
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@metabuilder/fakemui';
import { useWorkflows } from '@metabuilder/hooks';
import type { Workflow } from '@metabuilder/hooks';
import {
  AddIcon,
  SearchIcon,
  PlayIcon,
  EditIcon,
  DeleteIcon,
  FolderIcon,
} from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/dashboard.module.scss';

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--mat-sys-tertiary)',
  draft: 'var(--mat-sys-secondary)',
  paused: 'var(--mat-sys-error)',
  published: 'var(--mat-sys-primary)',
  deprecated: 'var(--mat-sys-outline)',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  paused: 'Paused',
  published: 'Published',
  deprecated: 'Deprecated',
};

export default function WorkflowsPage() {
  const { workflows, isLoading, error, listWorkflows, deleteWorkflow } = useWorkflows();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadWorkflows();
  }, [statusFilter, categoryFilter]);

  const loadWorkflows = async () => {
    const options: any = {};
    if (statusFilter !== 'all') options.status = statusFilter;
    if (categoryFilter !== 'all') options.category = categoryFilter;

    await listWorkflows(options);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      const success = await deleteWorkflow(id);
      if (success) {
        loadWorkflows();
      }
    }
  };

  const filteredWorkflows = (workflows || []).filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (workflow.description && workflow.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading && (!workflows || workflows.length === 0)) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
        <p>Loading workflows...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Workflows</h1>
          <p className={styles.pageSubtitle}>
            Create and manage automated workflows
          </p>
        </div>
        <Link href="/editor/new">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon size={20} />}
          >
            New Workflow
          </Button>
        </Link>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: 'var(--mat-sys-error-container)', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ margin: 0, color: 'var(--mat-sys-on-error-container)' }}>
            {error}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
          <TextField
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<SearchIcon size={20} />}
          />
        </div>
        <FormControl style={{ minWidth: '150px' }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: '150px' }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="automation">Automation</MenuItem>
            <MenuItem value="integration">Integration</MenuItem>
            <MenuItem value="data_processing">Data Processing</MenuItem>
            <MenuItem value="validation">Validation</MenuItem>
            <MenuItem value="utilities">Utilities</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
      </div>

      {filteredWorkflows.length === 0 ? (
        <EmptyState hasFilters={searchQuery !== '' || statusFilter !== 'all' || categoryFilter !== 'all'} />
      ) : (
        <div className={styles.grid}>
          {filteredWorkflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
  onDelete: (id: string) => void;
}

function WorkflowCard({ workflow, onDelete }: WorkflowCardProps) {
  return (
    <article className={styles.card}>
      <div
        className={styles.cardMedia}
        style={{ backgroundColor: STATUS_COLORS[workflow.status] || 'var(--mat-sys-primary)' }}
      >
        <div style={{ fontSize: '32px', color: 'white' }}>
          {workflow.metadata?.labels?.icon || '⚙️'}
        </div>
      </div>
      <div className={styles.cardContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
          <h3 className={styles.cardTitle}>{workflow.name}</h3>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: STATUS_COLORS[workflow.status] + '20',
              color: STATUS_COLORS[workflow.status],
            }}
          >
            {STATUS_LABELS[workflow.status] || workflow.status}
          </span>
        </div>
        <p className={styles.cardDescription}>
          {workflow.description || 'No description'}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--mat-sys-on-surface-variant)' }}>
          <span>{workflow.nodes?.length || 0} nodes</span>
          <span>•</span>
          <span>v{workflow.version}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <Link href={`/editor/${workflow.id}`} style={{ flex: 1 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<EditIcon size={16} />}
            >
              Edit
            </Button>
          </Link>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => onDelete(workflow.id)}
            startIcon={<DeleteIcon size={16} />}
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
}

function EmptyState({ hasFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <SearchIcon size={64} />
        </div>
        <h2 className={styles.emptyTitle}>No workflows found</h2>
        <p className={styles.emptyText}>
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <FolderIcon size={64} />
      </div>
      <h2 className={styles.emptyTitle}>No workflows yet</h2>
      <p className={styles.emptyText}>
        Create your first workflow to automate your processes
      </p>
      <Link href="/editor/new">
        <Button variant="contained" size="large" startIcon={<AddIcon size={22} />}>
          Create Your First Workflow
        </Button>
      </Link>
    </div>
  );
}
