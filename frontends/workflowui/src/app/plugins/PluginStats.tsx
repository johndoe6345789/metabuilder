/**
 * PluginStats - Plugin marketplace stats display
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/m3';
import styles from '@scss/atoms/plugins.module.scss';

interface PluginStatsProps {
  totalPlugins: number;
  installedPlugins: number;
  totalDownloads: number;
}

export default function PluginStats({
  totalPlugins,
  installedPlugins,
  totalDownloads,
}: PluginStatsProps) {
  return (
    <Box className={styles.stats}>
      <Box className={styles.statItem}>
        <Typography variant="caption">Total Plugins</Typography>
        <Typography variant="h5">{totalPlugins}</Typography>
      </Box>
      <Box className={styles.statItem}>
        <Typography variant="caption">Installed</Typography>
        <Typography variant="h5">{installedPlugins}</Typography>
      </Box>
      <Box className={styles.statItem}>
        <Typography variant="caption">
          Total Downloads
        </Typography>
        <Typography variant="h5">
          {totalDownloads.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
