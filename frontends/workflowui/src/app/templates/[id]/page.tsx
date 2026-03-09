/**
 * Template Detail Page
 * View template details and create project from template
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Breadcrumbs,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@metabuilder/fakemui';
import { templateService } from '@metabuilder/services';
import { TemplateHeader } from '@metabuilder/components/layout';
import { TemplateCard } from '@metabuilder/components/cards';
import styles from '@/../../../scss/atoms/template-detail.module.scss';

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params?.id as string;
  const template = templateService.getTemplate(templateId);
  const relatedTemplates = templateService.getRelatedTemplates(templateId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState(template?.name || '');
  const [workspace, setWorkspace] = useState('');
  const [customizeWorkflows, setCustomizeWorkflows] = useState(true);

  if (!template) {
    return (
      <Box className={styles.notFound}>
        <Typography variant="h3">Template not found</Typography>
        <Typography variant="body1" color="text.secondary">
          The template you're looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          href="/templates"
        >
          Back to Templates
        </Button>
      </Box>
    );
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating project:', projectName);
    setShowCreateForm(false);
  };

  return (
    <Box className={styles.templateDetail}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📋 Templates', href: '/templates' },
          { label: template.name, href: `/templates/${template.id}` },
        ]}
      />

      <TemplateHeader template={template} />

      {/* Tabs Navigation */}
      <Box component="nav" className={styles.tabs}>
        <Tabs value={0}>
          <Tab label="Overview" />
          <Tab label="Workflows" />
          <Tab label="Setup Guide" />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box component="main" className={styles.mainContent}>
        {/* Overview Section */}
        <Box component="section" className={styles.section}>
          <Typography variant="h5">Overview</Typography>
          <Typography variant="body1">
            {template.longDescription || template.description}
          </Typography>
        </Box>

        {/* Workflows Section */}
        <Box component="section" className={styles.section}>
          <Typography variant="h5">Included Workflows ({template.workflows.length})</Typography>
          <Box className={styles.workflowsList}>
            {template.workflows.map((workflow) => (
              <Box key={workflow.id} className={styles.workflowItem}>
                <Typography variant="h6">{workflow.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {workflow.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tags Section */}
        <Box component="section" className={styles.section}>
          <Typography variant="h6">Tags</Typography>
          <Box className={styles.tags}>
            {template.tags.map((tag) => (
              <Box key={tag} className={styles.tag}>
                {tag}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Related Templates */}
        <Box component="section" className={styles.section}>
          <Typography variant="h5">Related Templates</Typography>
          <Box className={styles.relatedGrid}>
            {relatedTemplates.map((related) => (
              <TemplateCard key={related.id} template={related} />
            ))}
          </Box>
        </Box>

        {/* Actions */}
        <Box className={styles.actions}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowCreateForm(true)}
          >
            Create Project from Template
          </Button>
        </Box>
      </Box>

      {/* Create Project Dialog */}
      <Dialog
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Project from Template</DialogTitle>
        <DialogContent>
          <Box component="form" className={styles.form}>
            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              select
              label="Workspace"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="default">Default Workspace</MenuItem>
              <MenuItem value="personal">Personal Projects</MenuItem>
              <MenuItem value="team">Team Workspace</MenuItem>
            </TextField>

            <Box className={styles.checkboxRow}>
              <Checkbox
                checked={customizeWorkflows}
                onChange={(e) => setCustomizeWorkflows(e.target.checked)}
              />
              <Typography variant="body2">
                Customize workflows before creating project
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateForm(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
