/**
 * CreateProjectDialog - Dialog to create a project from template
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@metabuilder/m3';
import styles from '@scss/atoms/template-detail.module.scss';

interface CreateProjectDialogProps {
  open: boolean;
  projectName: string;
  workspace: string;
  customizeWorkflows: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setProjectName: (v: string) => void;
  setWorkspace: (v: string) => void;
  setCustomizeWorkflows: (v: boolean) => void;
}

export default function CreateProjectDialog({
  open,
  projectName,
  workspace,
  customizeWorkflows,
  onClose,
  onSubmit,
  setProjectName,
  setWorkspace,
  setCustomizeWorkflows,
}: CreateProjectDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create Project from Template</DialogTitle>
      <DialogContent>
        <Box component="form" className={styles.form}>
          <TextField
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            select
            label="Workspace"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="default">
              Default Workspace
            </MenuItem>
            <MenuItem value="personal">
              Personal Projects
            </MenuItem>
            <MenuItem value="team">Team Workspace</MenuItem>
          </TextField>
          <Box className={styles.checkboxRow}>
            <Checkbox
              checked={customizeWorkflows}
              onChange={(e) =>
                setCustomizeWorkflows(e.target.checked)
              }
            />
            <Typography variant="body2">
              Customize workflows before creating project
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}
