/**
 * WorkspaceCreateProjectForm - Inline form for new project creation
 */

'use client';

import React from 'react';
import { Button, TextField } from '@metabuilder/m3';
import styles from '/atoms/workspace.module.scss';

interface WorkspaceCreateProjectFormProps {
  newProjectName: string;
  setNewProjectName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function WorkspaceCreateProjectForm({
  newProjectName,
  setNewProjectName,
  onSubmit,
  onCancel,
}: WorkspaceCreateProjectFormProps) {
  return (
    <div className={styles.createForm}>
      <form onSubmit={onSubmit}>
        <h3 className={styles.formTitle}>
          Create New Project
        </h3>
        <TextField
          label="Project Name"
          placeholder="Project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          autoFocus
        />
        <div className={styles.formActions}>
          <Button
            variant="filled"
            type="submit"
            disabled={!newProjectName.trim()}
          >
            Create
          </Button>
          <Button
            variant="outlined"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
