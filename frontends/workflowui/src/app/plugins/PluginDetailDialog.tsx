/**
 * PluginDetailDialog - Plugin detail modal
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@metabuilder/m3';
import PluginDialogContent from './PluginDialogContent';
import type { Plugin } from './hooks/usePlugins';

interface PluginDetailDialogProps {
  open: boolean;
  plugin: Plugin | null;
  onClose: () => void;
  onInstallToggle: () => void;
}

export default function PluginDetailDialog({
  open,
  plugin,
  onClose,
  onInstallToggle,
}: PluginDetailDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      {plugin && (
        <>
          <DialogTitle>{plugin.name}</DialogTitle>
          <DialogContent>
            <PluginDialogContent plugin={plugin} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
            <Button
              variant="contained"
              onClick={onInstallToggle}
              data-testid="plugin-action-button"
            >
              {plugin.installed ? 'Uninstall' : 'Install'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
