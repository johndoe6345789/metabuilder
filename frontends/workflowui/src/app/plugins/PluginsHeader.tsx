/**
 * PluginsHeader - Page title, subtitle, and stats banner
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/m3';
import styles from '@scss/atoms/plugins.module.scss';
import PluginStats from './PluginStats';

interface PluginsHeaderProps {
  totalPlugins: number;
  installedPlugins: number;
  totalDownloads: number;
}

export default function PluginsHeader({
  totalPlugins,
  installedPlugins,
  totalDownloads,
}: PluginsHeaderProps) {
  return (
    <Box className={styles.header}>
      <Box className={styles.headerContent}>
        <Typography
          variant="h3"
          data-testid="plugins-title"
        >
          Plugin Marketplace
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
        >
          Extend your workflows with powerful plugins
        </Typography>
        <PluginStats
          totalPlugins={totalPlugins}
          installedPlugins={installedPlugins}
          totalDownloads={totalDownloads}
        />
      </Box>
    </Box>
  );
}
