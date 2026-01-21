export const formatStorageError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const downloadJson = (data: unknown, filename: string) => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export const createJsonFileInput = (accept: string, onFileLoaded: (file: File) => void) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      onFileLoaded(file)
    }
  }
  input.click()
}
