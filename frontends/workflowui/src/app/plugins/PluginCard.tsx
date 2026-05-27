/**
 * PluginCard - Single plugin card in the grid
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Typography,
} from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/plugins.module.scss';
import type { Plugin } from './hooks/usePlugins';

interface PluginCardProps {
  plugin: Plugin;
  onClick: (plugin: Plugin) => void;
}

export default function PluginCard({
  plugin,
  onClick,
}: PluginCardProps) {
  return (
    <Card
      className={styles.pluginCard}
      onClick={() => onClick(plugin)}
      data-testid={`plugin-card-${plugin.id}`}
    >
      <Box
        className={styles.pluginIcon}
        sx={{ backgroundColor: plugin.color }}
      >
        <span style={{ fontSize: 32 }}>{plugin.icon}</span>
      </Box>

      <CardContent className={styles.pluginContent}>
        <Box className={styles.pluginHeader}>
          <Typography variant="h6" className={styles.pluginTitle}>
            {plugin.name}
          </Typography>
          {plugin.installed && (
            <Box
              className={`${styles.pluginBadge} ${styles.installed}`}
            >
              ✓ Installed
            </Box>
          )}
        </Box>

        <Typography
          variant="body2"
          className={styles.pluginDescription}
        >
          {plugin.description}
        </Typography>

        <Box className={styles.pluginMeta}>
          <Box className={styles.metaItem}>
            <span>v{plugin.version}</span>
          </Box>
          <Box className={styles.metaItem}>
            <span>⭐ {plugin.rating}</span>
          </Box>
          <Box className={styles.metaItem}>
            <span>⬇️ {plugin.downloads.toLocaleString()}</span>
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          variant={plugin.installed ? 'outlined' : 'contained'}
          fullWidth
        >
          {plugin.installed ? 'Configure' : 'Install'}
        </Button>
      </CardActions>
    </Card>
  );
}
