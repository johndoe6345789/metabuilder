/**
 * TemplateRelatedSection - Related templates grid
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/fakemui';
import { TemplateCard } from '@metabuilder/components/cards';
import type { ProjectTemplate } from '@metabuilder/types';
import styles from '@/../../../scss/atoms/template-detail.module.scss';

interface TemplateRelatedSectionProps {
  relatedTemplates: ProjectTemplate[];
}

export default function TemplateRelatedSection({
  relatedTemplates,
}: TemplateRelatedSectionProps) {
  return (
    <Box component="section" className={styles.section}>
      <Typography variant="h5">Related Templates</Typography>
      <Box className={styles.relatedGrid}>
        {relatedTemplates.map((related) => (
          <TemplateCard key={related.id} template={related} />
        ))}
      </Box>
    </Box>
  );
}
