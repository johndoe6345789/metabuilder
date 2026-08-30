'use client'

import { Button } from '@/m3'
import type { RegistryPackage } from '../use-package-registry'
import s from '../PackageManager.module.scss'

export interface PackageCardActionsProps {
  p: RegistryPackage
  publishing: string | null
  onPublish: () => void
  onEdit: () => void
  onArchiveToggle: () => void
  onDuplicate: () => void
  onDelete: () => void
}

/** Publish, edit, archive, duplicate, delete -- one package's controls. */
export function PackageCardActions(props: PackageCardActionsProps) {
  const isPublishing = props.publishing === props.p.manifest.id

  return (
    <div className={s.actions}>
      <Button
        size="small"
        variant="contained"
        disabled={isPublishing}
        onClick={props.onPublish}
      >
        {isPublishing ? 'Publishing…' : '⇧ Publish'}
      </Button>
      <Button size="small" variant="text" onClick={props.onEdit}>
        Edit
      </Button>
      <Button size="small" variant="text" onClick={props.onArchiveToggle}>
        {props.p.archived ? 'Unarchive' : 'Archive'}
      </Button>
      <Button size="small" variant="text" onClick={props.onDuplicate}>
        Duplicate
      </Button>
      <Button
        size="small"
        variant="text"
        color="error"
        onClick={props.onDelete}
      >
        Delete
      </Button>
    </div>
  )
}
