/**
 * PluginDialogContent - Body content of the plugin detail dialog
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@metabuilder/m3';
import styles from '/atoms/plugins.module.scss';
import type { Plugin } from './hooks/usePlugins';

interface PluginDialogContentProps {
  plugin: Plugin;
}

export default function PluginDialogContent({
  plugin,
}: PluginDialogContentProps) {
  return (
    <Box className={styles.dialogContent}>
      <Box
        className={styles.dialogIcon}
        sx={{ backgroundColor: plugin.color }}
      >
        <span style={{ fontSize: 40 }}>{plugin.icon}</span>
      </Box>

      <Box className={styles.dialogHeader}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Version {plugin.version}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            By {plugin.author}
          </Typography>
        </Box>
        {plugin.installed && (
          <Chip
            label="Installed"
            color="primary"
            size="small"
          />
        )}
      </Box>

      <Typography variant="body1">
        {plugin.description}
      </Typography>

      <Box className={styles.dialogMeta}>
        <Box className={styles.metaItem}>
          <Typography variant="caption">Rating</Typography>
          <Typography variant="body2">
            ⭐ {plugin.rating}/5.0
          </Typography>
        </Box>
        <Box className={styles.metaItem}>
          <Typography variant="caption">Downloads</Typography>
          <Typography variant="body2">
            ⬇️ {plugin.downloads.toLocaleString()}
          </Typography>
        </Box>
        <Box className={styles.metaItem}>
          <Typography variant="caption">Category</Typography>
          <Typography variant="body2">
            {plugin.category}
          </Typography>
        </Box>
      </Box>

      <Box className={styles.dialogSection}>
        <Typography
          variant="h6"
          className={styles.dialogSectionTitle}
        >
          Features
        </Typography>
        <Box component="ul" className={styles.featureList}>
          {plugin.features.map((feature, index) => (
            <Box
              key={index}
              component="li"
              className={styles.featureItem}
            >
              <span>✓</span>
              <Typography variant="body2">
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
