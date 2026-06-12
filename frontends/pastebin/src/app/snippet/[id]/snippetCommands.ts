import { CommandItem } from '@/components/features/file-ops/FileCommandPalette'
import { Snippet } from '@/lib/types'

type FileList = { name: string; content: string }[]

interface CommandContext {
  vm: {
    handleNewFile: () => void
    handleStartRename: (name: string) => void
    handleDuplicateFile: (name: string, files: FileList) => void
    handleDeleteFile: (
      name: string,
      files: FileList,
      cb: (n: string) => void,
    ) => void
    handleCopyPath: () => void
    handleCopy: (code: string) => void
    handleRun: (files: FileList) => void
    setWordWrap: (fn: (w: 'on' | 'off') => 'on' | 'off') => void
    setShowPreview: (fn: (p: boolean) => boolean) => void
    setActiveTab: (tab: 'code' | 'terminal' | 'debug') => void
    setEditOpen: (open: boolean) => void
    terminal: { isRunning: boolean; handleStop: () => void }
  }
  snippet: Snippet
  activeFile: string
  activeCode: string
  files: FileList
  canPreview: boolean
  onBack: () => void
}

export function buildCommands(ctx: CommandContext): CommandItem[] {
  const { vm, activeFile, activeCode, files, canPreview, onBack } = ctx
  return [
    {
      id: 'new-file',
      label: 'New File',
      icon: 'note_add',
      shortcut: '⌘N',
      group: 'FILE',
      action: vm.handleNewFile,
    },
    {
      id: 'rename-file',
      label: 'Rename File',
      icon: 'edit',
      shortcut: 'F2',
      group: 'FILE',
      action: () => vm.handleStartRename(activeFile),
    },
    {
      id: 'duplicate-file',
      label: 'Duplicate File',
      icon: 'content_copy',
      shortcut: '⌘D',
      group: 'FILE',
      action: () => vm.handleDuplicateFile(activeFile, files),
    },
    {
      id: 'delete-file',
      label: 'Delete File',
      icon: 'delete',
      shortcut: '⌦',
      group: 'FILE',
      action: () => vm.handleDeleteFile(activeFile, files, () => {}),
      disabled: files.length <= 1,
      danger: true,
    },
    {
      id: 'copy-path',
      label: 'Copy File Path',
      icon: 'link',
      shortcut: '⌥⌘C',
      group: 'FILE',
      action: vm.handleCopyPath,
    },
    {
      id: 'copy-code',
      label: 'Copy Code',
      icon: 'content_copy',
      shortcut: '⌘C',
      group: 'CLIPBOARD',
      action: () => vm.handleCopy(activeCode),
    },
    {
      id: 'toggle-wrap',
      label: 'Toggle Word Wrap',
      icon: 'wrap_text',
      shortcut: '⌥Z',
      group: 'VIEW',
      action: () => vm.setWordWrap(w => (w === 'on' ? 'off' : 'on')),
    },
    {
      id: 'toggle-preview',
      label: 'Toggle Preview',
      icon: 'vertical_split',
      shortcut: '⌘\\',
      group: 'VIEW',
      action: () => vm.setShowPreview(p => !p),
      disabled: !canPreview,
    },
    {
      id: 'focus-editor',
      label: 'Focus Editor',
      icon: 'insert_drive_file',
      shortcut: '⌘1',
      group: 'VIEW',
      action: () => vm.setActiveTab('code'),
    },
    {
      id: 'focus-terminal',
      label: 'Focus Terminal',
      icon: 'terminal',
      shortcut: '⌃`',
      group: 'VIEW',
      action: () => vm.setActiveTab('terminal'),
    },
    {
      id: 'run-code',
      label: 'Run Code',
      icon: 'play_arrow',
      shortcut: 'F5',
      group: 'RUN',
      action: () => vm.handleRun(files),
      disabled: vm.terminal.isRunning,
    },
    {
      id: 'stop-execution',
      label: 'Stop Execution',
      icon: 'stop',
      shortcut: '⌃C',
      group: 'RUN',
      action: vm.terminal.handleStop,
      disabled: !vm.terminal.isRunning,
    },
    {
      id: 'edit-metadata',
      label: 'Edit Snippet Metadata',
      icon: 'edit',
      shortcut: '',
      group: 'NAVIGATE',
      action: () => vm.setEditOpen(true),
    },
    {
      id: 'go-back',
      label: 'Back to Snippets',
      icon: 'arrow_back',
      shortcut: '⌘←',
      group: 'NAVIGATE',
      action: onBack,
    },
  ]
}
