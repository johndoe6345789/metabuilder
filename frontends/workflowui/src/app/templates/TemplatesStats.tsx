/**
 * TemplatesStats - Stats banner for the templates page header
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/m3';
import styles from '/atoms/templates.module.scss';

interface TemplatesStatsProps {
  totalTemplates: number;
  totalDownloads: number;
  averageRating: number;
}

export default function TemplatesStats({
  totalTemplates,
  totalDownloads,
  averageRating,
}: TemplatesStatsProps) {
  return (
    <Box className={styles.stats}>
      <Box className={styles.statItem}>
        <Typography variant="caption">Templates</Typography>
        <Typography variant="h5">{totalTemplates}</Typography>
      </Box>
      <Box className={styles.statItem}>
        <Typography variant="caption">Downloads</Typography>
        <Typography variant="h5">
          {totalDownloads.toLocaleString()}
        </Typography>
      </Box>
      <Box className={styles.statItem}>
        <Typography variant="caption">Avg Rating</Typography>
        <Typography variant="h5">
          ⭐ {averageRating.toFixed(1)}
        </Typography>
      </Box>
    </Box>
  );
}
