import type React from 'react'

export const createFileSelector =
  (onValidFile: (file: File) => void, onInvalid: (message: string) => void) =>
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.zip')) {
      onInvalid('Please select a .zip file')
      return
    }

    onValidFile(file)
  }
