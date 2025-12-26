import Editor from '@monaco-editor/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import type { FileNode } from '@/lib/nerd-mode-ide'
import { NerdModeConsolePanel } from './NerdModeConsolePanel'
import { NerdModeEditorHeader } from '../components/NerdModeEditorHeader'
import { NerdModeEmptyState } from '../components/NerdModeEmptyState'
import { NerdModeGitPanel } from './NerdModeGitPanel'
import { NerdModeTestsPanel } from './NerdModeTestsPanel'
import type { GitConfig, TestResult } from '../core/types'

interface NerdModeEditorPanelProps {
  selectedFile: FileNode | null
  fileContent: string
  isRunning: boolean
  consoleOutput: string[]
  testResults: TestResult[]
  gitConfig: GitConfig | null
  gitCommitMessage: string
  onFileChange: (value: string) => void
  onRunCode: () => void
  onSaveFile: () => void
  onDeleteFile: () => void
  onClearConsole: () => void
  onRunTests: () => void
  onCommitMessageChange: (value: string) => void
  onGitPush: () => void
  onGitPull: () => void
  onOpenGitConfig: () => void
}

export function NerdModeEditorPanel({
  selectedFile,
  fileContent,
  isRunning,
  consoleOutput,
  testResults,
  gitConfig,
  gitCommitMessage,
  onFileChange,
  onRunCode,
  onSaveFile,
  onDeleteFile,
  onClearConsole,
  onRunTests,
  onCommitMessageChange,
  onGitPush,
  onGitPull,
  onOpenGitConfig,
}: NerdModeEditorPanelProps) {
  if (!selectedFile) {
    return <NerdModeEmptyState />
  }

  return (
    <div className="col-span-3 flex flex-col">
      <NerdModeEditorHeader
        selectedFile={selectedFile}
        isRunning={isRunning}
        onRunCode={onRunCode}
        onSave={onSaveFile}
        onDelete={onDeleteFile}
      />

      <div className="flex-1">
        <Tabs defaultValue="editor" className="h-full">
          <TabsList className="w-full justify-start rounded-none border-b">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="git">Git</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="h-[calc(100%-40px)] m-0">
            <Editor
              height="100%"
              language={selectedFile.language || 'typescript'}
              value={fileContent}
              onChange={(value) => onFileChange(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </TabsContent>

          <TabsContent value="console" className="m-0">
            <NerdModeConsolePanel consoleOutput={consoleOutput} onClear={onClearConsole} />
          </TabsContent>

          <TabsContent value="tests" className="m-0">
            <NerdModeTestsPanel testResults={testResults} onRunTests={onRunTests} />
          </TabsContent>

          <TabsContent value="git" className="m-0">
            <NerdModeGitPanel
              gitConfig={gitConfig}
              gitCommitMessage={gitCommitMessage}
              onCommitMessageChange={onCommitMessageChange}
              onGitPush={onGitPush}
              onGitPull={onGitPull}
              onOpenConfig={onOpenGitConfig}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
