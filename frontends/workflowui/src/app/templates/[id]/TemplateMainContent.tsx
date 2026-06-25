/** TemplateMainContent - Overview, workflows, tags, related, actions */

'use client';

import React from 'react';
import { Box, Typography, Button } from '@metabuilder/m3';
import type { ProjectTemplate } from '@metabuilder/types';
import styles from '@scss/atoms/template-detail.module.scss';
import TemplateWorkflowsList from './TemplateWorkflowsList';
import TemplateTagsSection from './TemplateTagsSection';
import TemplateRelatedSection from './TemplateRelatedSection';

interface TemplateMainContentProps {
  template: ProjectTemplate;
  relatedTemplates: ProjectTemplate[];
  onCreateProject: () => void;
}

export default function TemplateMainContent({
  template,
  relatedTemplates,
  onCreateProject,
}: TemplateMainContentProps) {
  return (
    <Box component="main" className={styles.mainContent}>
      <Box component="section" className={styles.section}>
        <Typography variant="h5">Overview</Typography>
        <Typography variant="body1">
          {template.longDescription || template.description}
        </Typography>
      </Box>
      <TemplateWorkflowsList
        workflows={template.workflows}
      />
      <TemplateTagsSection tags={template.tags} />
      <TemplateRelatedSection
        relatedTemplates={relatedTemplates}
      />
      <Box className={styles.actions}>
        <Button
          variant="contained"
          size="large"
          onClick={onCreateProject}
        >
          Create Project from Template
        </Button>
      </Box>
    </Box>
  );
}
