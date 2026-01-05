/**
 * useCodeEditor hook (stub)
 */

export interface EditorFile {
  path: string
  content: string
  language?: string
}

export function useCodeEditor() {
  // TODO: Implement useCodeEditor
  return {
    files: [] as EditorFile[],
    currentFile: null as EditorFile | null,
    openFile: (file: EditorFile) => {},
    saveFile: (file: EditorFile) => {},
    closeFile: (path: string) => {},
  }
}
