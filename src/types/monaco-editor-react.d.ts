declare module '@monaco-editor/react' {
  import type { ComponentType } from 'react'
  
  export interface EditorProps {
    height?: string | number
    width?: string | number
    value?: string
    defaultValue?: string
    language?: string
    defaultLanguage?: string
    theme?: string
    line?: number
    loading?: string | React.ReactNode
    options?: Record<string, any>
    overrideServices?: Record<string, any>
    saveViewState?: boolean
    keepCurrentModel?: boolean
    path?: string
    onChange?: (value: string | undefined, event: any) => void
    onMount?: (editor: any, monaco: any) => void
    onValidate?: (markers: any[]) => void
    beforeMount?: (monaco: any) => void
  }
  
  const Editor: ComponentType<EditorProps>
  export default Editor
  
  export function useMonaco(): any
  export function loader(): any
}
