/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@monaco-editor/react' {
  import type { ComponentType, ReactNode } from 'react'
  import type { editor, languages } from 'monaco-editor'
  import type * as MonacoNamespace from 'monaco-editor'

  type Monaco = typeof MonacoNamespace

  export interface EditorProps {
    height?: string | number
    width?: string | number
    value?: string
    defaultValue?: string
    language?: string
    defaultLanguage?: string
    theme?: string
    line?: number
    loading?: string | ReactNode
    options?: editor.IStandaloneEditorConstructionOptions
    overrideServices?: editor.IEditorOverrideServices
    saveViewState?: boolean
    keepCurrentModel?: boolean
    path?: string
    onChange?: (value: string | undefined, event?: editor.IModelContentChangedEvent) => void
    onMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void
    onValidate?: (markers: languages.IMarker[]) => void
    beforeMount?: (monaco: Monaco) => void
  }

  const Editor: ComponentType<EditorProps>
  export default Editor

  export function useMonaco(): Monaco | null
  export function loader(): Promise<Monaco>
}
