'use client'

import type { ChangeEvent, RefObject } from 'react'
import { Button, Typography } from '@/m3'
import { useDropZone } from '../use-drop-zone'
import s from '../AssetsTab.module.scss'

export interface AssetDropZoneProps {
  busy: boolean
  pickerRef: RefObject<HTMLInputElement | null>
  onFile: (file: File | undefined) => void
}

/** Drag a file in, or pick one from disk. */
export function AssetDropZone({ busy, pickerRef, onFile }: AssetDropZoneProps) {
  const drop = useDropZone(onFile)

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onFile(event.target.files?.[0])
    // Let the same file be picked again after a failure.
    event.target.value = ''
  }

  return (
    <div
      className={`${s.drop} ${drop.dragging ? s.dropActive : ''}`}
      onDragOver={drop.onDragOver}
      onDragLeave={drop.onDragLeave}
      onDrop={drop.onDrop}
    >
      <span className="material-symbols-rounded" aria-hidden="true">
        cloud_upload
      </span>
      <div>
        <div className={s.dropTitle}>Drop a file here to add it</div>
        <Typography variant="caption" className={s.hint}>
          Images and PDFs, up to 8MB
        </Typography>
      </div>
      <Button
        size="small"
        variant="contained"
        disabled={busy}
        onClick={() => pickerRef.current?.click()}
      >
        {busy ? 'Uploading…' : 'Choose a file'}
      </Button>
      <input
        ref={pickerRef}
        type="file"
        hidden
        accept="image/*,application/pdf"
        onChange={onChange}
      />
    </div>
  )
}
