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
    openFile: (_file: EditorFile) => {},
    saveFile: (_file: EditorFile) => {},
    closeFile: (_path: string) => {},
  }
}
