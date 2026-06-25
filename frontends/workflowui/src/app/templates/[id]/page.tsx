/** Template Detail Page */

'use client';

import React from 'react';
import {
  Breadcrumbs, Tabs, Tab, Box,
} from '@metabuilder/m3';
import { TemplateHeader } from '@metabuilder/components/layout';
import styles from '@scss/atoms/template-detail.module.scss';
import { useTemplateDetail } from './hooks/useTemplateDetail';
import CreateProjectDialog from './CreateProjectDialog';
import TemplateNotFound from './TemplateNotFound';
import TemplateMainContent from './TemplateMainContent';

export default function TemplateDetailPage() {
  const {
    template, relatedTemplates,
    showCreateForm, setShowCreateForm,
    projectName, setProjectName,
    workspace, setWorkspace,
    customizeWorkflows, setCustomizeWorkflows,
    handleCreateProject,
  } = useTemplateDetail();

  if (!template) return <TemplateNotFound />;

  return (
    <Box className={styles.templateDetail}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📋 Templates', href: '/templates' },
          { label: template.name,
            href: `/templates/${template.id}` },
        ]}
      />
      <TemplateHeader template={template} />
      <Box component="nav" className={styles.tabs}>
        <Tabs value={0}>
          <Tab label="Overview" />
          <Tab label="Workflows" />
          <Tab label="Setup Guide" />
        </Tabs>
      </Box>
      <TemplateMainContent
        template={template}
        relatedTemplates={relatedTemplates}
        onCreateProject={() => setShowCreateForm(true)}
      />
      <CreateProjectDialog
        open={showCreateForm}
        projectName={projectName}
        workspace={workspace}
        customizeWorkflows={customizeWorkflows}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateProject}
        setProjectName={setProjectName}
        setWorkspace={setWorkspace}
        setCustomizeWorkflows={setCustomizeWorkflows}
      />
    </Box>
  );
}
