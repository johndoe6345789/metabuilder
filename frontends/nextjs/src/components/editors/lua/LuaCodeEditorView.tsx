import Editor from '@monaco-editor/react'
import { ArrowsOut, BookOpen, FileCode } from '@phosphor-icons/react'
import { Button } from '@/components/ui'
import { Label } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { LuaSnippetLibrary } from '@/components/editors/lua/LuaSnippetLibrary'
import { getLuaExampleCode, getLuaExamplesList } from '@/lib/lua-examples'
import type { LuaScript } from '@/lib/level-types'
import { toast } from 'sonner'

interface LuaCodeEditorViewProps {
  currentScript: LuaScript
  isFullscreen: boolean
  showSnippetLibrary: boolean
  onSnippetLibraryChange: (value: boolean) => void
  onInsertSnippet: (code: string) => void
  onToggleFullscreen: () => void
  onUpdateCode: (code: string) => void
  editorRef: { current: any }
}

export function LuaCodeEditorView({
  currentScript,
  isFullscreen,
  showSnippetLibrary,
  onSnippetLibraryChange,
  onInsertSnippet,
  onToggleFullscreen,
  onUpdateCode,
  editorRef,
}: LuaCodeEditorViewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Lua Code</Label>
        <div className="flex gap-2">
          <Sheet open={showSnippetLibrary} onOpenChange={onSnippetLibraryChange}>
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
                <LuaSnippetLibrary onInsertSnippet={onInsertSnippet} />
              </div>
            </SheetContent>
          </Sheet>
          <Select
            onValueChange={value => {
              const exampleCode = getLuaExampleCode(value as any)
              onUpdateCode(exampleCode)
              toast.success('Example loaded')
            }}
          >
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
      <div className={`border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 bg-background' : ''}`}>
        <Editor
          height={isFullscreen ? 'calc(100vh - 8rem)' : '400px'}
          language="lua"
          value={currentScript.code}
          onChange={value => onUpdateCode(value || '')}
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
        Write Lua code. Access parameters via <code className="font-mono">context.data</code>. Use
        <code className="font-mono"> log()</code> or <code className="font-mono">print()</code> for output. Press
        <code className="font-mono"> Ctrl+Space</code> for autocomplete.
      </p>
    </div>
  )
}
