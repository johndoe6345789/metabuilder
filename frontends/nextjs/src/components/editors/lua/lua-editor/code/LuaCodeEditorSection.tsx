import Editor, { useMonaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useRef } from 'react'
import { toast } from 'sonner'

import { LuaSnippetLibrary } from '@/components/editors/lua/LuaSnippetLibrary'
import { Button } from '@/components/ui'
import { Label } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { ArrowsOut, BookOpen, FileCode } from '@/fakemui/icons'
import type { LuaScript } from '@/lib/level-types'
import type { LuaExampleKey } from '@/lib/lua-examples'
import { getLuaExampleCode, getLuaExamplesList } from '@/lib/lua-examples'

import { useLuaMonacoConfig } from './useLuaMonacoConfig'

interface LuaCodeEditorSectionProps {
  script: LuaScript
  isFullscreen: boolean
  onToggleFullscreen: () => void
  showSnippetLibrary: boolean
  onShowSnippetLibraryChange: (open: boolean) => void
  onUpdateScript: (updates: Partial<LuaScript>) => void
}

export const LuaCodeEditorSection = ({
  script,
  isFullscreen,
  onToggleFullscreen,
  showSnippetLibrary,
  onShowSnippetLibraryChange,
  onUpdateScript,
}: LuaCodeEditorSectionProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()

  useLuaMonacoConfig(monaco)

  const handleInsertSnippet = (code: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection()
      if (selection) {
        editorRef.current.executeEdits('', [
          {
            range: selection,
            text: code,
            forceMoveMarkers: true,
          },
        ])
        editorRef.current.focus()
      }
    }

    if (!editorRef.current) {
      const currentCode = script.code
      const newCode = currentCode ? `${currentCode}\n\n${code}` : code
      onUpdateScript({ code: newCode })
    }

    onShowSnippetLibraryChange(false)
  }

  const handleExampleLoad = (value: string) => {
    const exampleCode = getLuaExampleCode(value as LuaExampleKey)
    onUpdateScript({ code: exampleCode })
    toast.success('Example loaded')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Lua Code</Label>
        <div className="flex gap-2">
          <Sheet open={showSnippetLibrary} onOpenChange={onShowSnippetLibraryChange}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <BookOpen size={16} className="mr-2" />
                Snippet Library
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Lua Snippet Library</SheetTitle>
                <SheetDescription>Browse and insert pre-built code templates</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <LuaSnippetLibrary onInsertSnippet={handleInsertSnippet} />
              </div>
            </SheetContent>
          </Sheet>
          <Select onValueChange={handleExampleLoad}>
            <SelectTrigger className="w-[180px]">
              <FileCode size={16} className="mr-2" />
              <SelectValue placeholder="Examples" />
            </SelectTrigger>
            <SelectContent>
              {getLuaExamplesList().map(example => (
                <SelectItem key={example.key} value={example.key}>
                  <div>
                    <div className="font-medium">{example.name}</div>
                    <div className="text-xs text-muted-foreground">{example.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
            <ArrowsOut size={16} />
          </Button>
        </div>
      </div>
      <div
        className={`border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 bg-background' : ''}`}
      >
        <Editor
          height={isFullscreen ? 'calc(100vh - 8rem)' : '400px'}
          language="lua"
          value={script.code}
          onChange={value => onUpdateScript({ code: value || '' })}
          onMount={editor => {
            editorRef.current = editor
          }}
          theme="vs-dark"
          options={{
            minimap: { enabled: isFullscreen },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'inline',
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Write Lua code. Access parameters via <code className="font-mono">context.data</code>. Use{' '}
        <code className="font-mono">log()</code> or <code className="font-mono">print()</code> for
        output. Press <code className="font-mono">Ctrl+Space</code> for autocomplete.
      </p>
    </div>
  )
}
