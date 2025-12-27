import type { FileNode } from '@/lib/nerd-mode-ide'
import type { GitConfig, TestResult } from '../types'
import { NerdModeEditorPanel } from '../../panels/NerdModeEditorPanel'

interface EditorPaneProps {
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

export function EditorPane(props: EditorPaneProps) {
  return <NerdModeEditorPanel {...props} />
}
