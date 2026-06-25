/**
 * TemplateTagsSection - Tags row for template detail page
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/m3';
import styles from '/atoms/template-detail.module.scss';

interface TemplateTagsSectionProps {
  tags: string[];
}

export default function TemplateTagsSection({
  tags,
}: TemplateTagsSectionProps) {
  return (
    <Box component="section" className={styles.section}>
      <Typography variant="h6">Tags</Typography>
      <Box className={styles.tags}>
        {tags.map((tag) => (
          <Box key={tag} className={styles.tag}>
            {tag}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
