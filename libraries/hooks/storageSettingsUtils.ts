/**
 * Utility functions for storage data import/export operations
 */

/**
 * Downloads data as a JSON file
 */
export const downloadJson = (data: unknown, filename: string): void => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Creates a file input for JSON import and triggers file selection
 */
export const createJsonFileInput = (
  accept: string,
  onFileSelected: (file: File) => void
): void => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }
  input.click()
}

/**
 * Formats storage-related errors for display
 */
export const formatStorageError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}
