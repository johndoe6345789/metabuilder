'use client'

import { useState, type DragEvent } from 'react'

/** Drag-over highlighting and pulling the dropped file out of the event. */
export function useDropZone(onFile: (file: File | undefined) => void) {
  const [dragging, setDragging] = useState(false)

  return {
    dragging,
    onDragOver: (event: DragEvent) => {
      event.preventDefault()
      setDragging(true)
    },
    onDragLeave: () => {
      setDragging(false)
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      setDragging(false)
      onFile(event.dataTransfer.files[0])
    },
  }
}
