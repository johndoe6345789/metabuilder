/**
 * CreateProjectForm Component
 * Simple project creation form
 */

import React from 'react'
import { Button, TextField } from '../fakemui'
import styles from '../../scss/components/forms/create-project-form.module.scss'

interface CreateProjectFormProps {
  name: string
  onNameChange: (name: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  [key: string]: any
}

/**
 * CreateProjectForm - Minimal project creation form
 */
export const CreateProjectForm = ({
  name,
  onNameChange,
  onSubmit,
  onCancel,
  ...rest
}: CreateProjectFormProps) => {
  return (
    <div className={styles.form} {...rest}>
      <form onSubmit={onSubmit}>
        <h3 className={styles.title}>Create New Project</h3>
        <TextField
          label="Project Name"
          placeholder="Project name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
        />
        <div className={styles.actions}>
          <Button variant="filled" type="submit" disabled={!name.trim()}>
            Create
          </Button>
          <Button variant="outlined" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
