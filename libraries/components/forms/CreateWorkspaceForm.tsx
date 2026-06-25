/**
 * CreateWorkspaceForm Component
 * Form for creating new workspace with preview
 */

import React, { useState } from 'react'
import { Button, TextField } from '../fakemui'
import { AddIcon } from '../../icons/react'
import styles from '../../scss/components/forms/create-workspace-form.module.scss'

const WORKSPACE_COLORS = [
  '#6750A4', '#625B71', '#7D5260', '#BA1A1A',
  '#006E1C', '#00639B', '#A8541D', '#5C5C5C',
]

interface CreateWorkspaceFormProps {
  name: string
  onNameChange: (name: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  [key: string]: any
}

/**
 * CreateWorkspaceForm - Workspace creation with live preview
 */
export const CreateWorkspaceForm = ({
  name,
  onNameChange,
  onSubmit,
  onCancel,
  ...rest
}: CreateWorkspaceFormProps) => {
  const [color, setColor] = useState(WORKSPACE_COLORS[0])
  const [description, setDescription] = useState('')

  const initials = name.trim()
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'WS'

  return (
    <div className={styles.form} {...rest}>
      <div className={styles.preview}>
        <div className={styles.previewCard}>
          <div className={styles.previewMedia} style={{ backgroundColor: color }}>
            <span className={styles.previewInitials}>{initials}</span>
          </div>
          <div className={styles.previewContent}>
            <p className={styles.previewTitle}>{name || 'Workspace Name'}</p>
            <p className={styles.previewDesc}>{description || 'No description'}</p>
          </div>
        </div>
        <div className={styles.colorPicker}>
          {WORKSPACE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.colorSwatch} ${c === color ? styles.active : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <form className={styles.fields} onSubmit={onSubmit}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>
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

        <div className={styles.group}>
          <label className={styles.label}>Description (Optional)</label>
          <textarea
            className={styles.textarea}
            placeholder="What will this workspace be used for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="contained" color="primary" disabled={!name.trim()}>
            Create Workspace
          </Button>
          <Button type="button" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
