/**
 * CreateWorkspaceForm - Form to create a new workspace
 */

'use client';

import React, { useState } from 'react';
import { Button, TextField } from '@metabuilder/m3';
import { AddIcon } from '@/../../../icons/react';
import styles from '/atoms/dashboard.module.scss';
import WorkspacePreviewPanel from './WorkspacePreviewPanel';

interface CreateWorkspaceFormProps {
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function CreateWorkspaceForm({
  name,
  onNameChange,
  onSubmit,
  onCancel,
}: CreateWorkspaceFormProps) {
  const [color, setColor] = useState('#6750A4');
  const [description, setDescription] = useState('');

  return (
    <div className={styles.createForm}>
      <WorkspacePreviewPanel
        name={name}
        color={color}
        description={description}
        onColorChange={setColor}
      />

      <form className={styles.formFields} onSubmit={onSubmit}>
        <h2 className={styles.formTitle}>
          <span className={styles.formTitleIcon}>
            <AddIcon size={20} />
          </span>
          Create New Workspace
        </h2>
        <TextField
          label="Workspace Name"
          placeholder="e.g., Marketing Automation"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
        />
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Description (Optional)
          </label>
          <textarea
            className={styles.formTextarea}
            placeholder="What will this workspace be used for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className={styles.formActions}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!name.trim()}
          >
            Create Workspace
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
