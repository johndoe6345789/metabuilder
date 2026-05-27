/**
 * TemplateNotFound - Fallback when template is missing
 */

'use client';

import React from 'react';
import { Box, Typography, Button } from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/template-detail.module.scss';

export default function TemplateNotFound() {
  return (
    <Box className={styles.notFound}>
      <Typography variant="h3">
        Template not found
      </Typography>
      <Typography variant="body1" color="text.secondary">
        The template you&apos;re looking for doesn&apos;t exist.
      </Typography>
      <Button variant="contained" href="/templates">
        Back to Templates
      </Button>
    </Box>
  );
}
