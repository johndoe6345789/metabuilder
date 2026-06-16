import type { editor as MonacoEditorNS } from 'monaco-editor'

interface OptionsArgs {
  wordWrap: 'on' | 'off'
  readOnly: boolean
  glyphMargin: boolean
}

/** Construction options for the snippet Monaco editor. */
export function buildEditorOptions({
  wordWrap,
  readOnly,
  glyphMargin,
}: OptionsArgs): MonacoEditorNS.IStandaloneEditorConstructionOptions {
  return {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    glyphMargin,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap,
    readOnly,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      useShadows: false,
    },
    padding: { top: 12, bottom: 12 },
    fontFamily: 'JetBrains Mono, monospace',
    fontLigatures: true,
  }
}
