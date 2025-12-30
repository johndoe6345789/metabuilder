import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useKV } from '@/hooks/data/useKV'
import type { FileNode } from '@/lib/nerd-mode-ide'
import {
  appendExportPath,
  buildZipFromFileTree,
  fileTreeOperations,
  getPackageTemplateById,
  getPackageTemplates,
} from '@/lib/nerd-mode-ide'

import type { GitConfig, TestResult } from '../types'

export function useNerdIdeState() {
  const templates = useMemo(() => getPackageTemplates(), [])
  const defaultTemplate = templates[0]

  const [fileTree, setFileTree] = useKV<FileNode[]>('nerd-mode-file-tree', defaultTemplate.tree)
  const [workspaceName, setWorkspaceName] = useKV<string>(
    'nerd-mode-workspace',
    defaultTemplate.rootName
  )
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(fileTree?.[0]?.id ?? null)
  const [fileContent, setFileContent] = useState('')
  const [gitConfig, setGitConfig] = useKV<GitConfig | null>('nerd-mode-git-config', null)
  const [showGitDialog, setShowGitDialog] = useState(false)
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [gitCommitMessage, setGitCommitMessage] = useState('')

  const selectedFile = useMemo(() => {
    if (!fileTree || !selectedFileId) return null
    return fileTreeOperations.findNodeById(fileTree, selectedFileId)
  }, [fileTree, selectedFileId])

  useEffect(() => {
    if (!fileTree) return
    if (!selectedFileId) {
      const firstFile = fileTreeOperations.findFirstFile(fileTree)
      if (firstFile) {
        setSelectedFileId(firstFile.id)
      }
      return
    }

    const fileNode = fileTreeOperations.findNodeById(fileTree, selectedFileId)
    if (fileNode?.type === 'file') {
      setFileContent(fileNode.content ?? '')
    }
  }, [fileTree, selectedFileId])

  const handleToggleFolder = (nodeId: string) => {
    if (!fileTree) return
    const node = fileTreeOperations.findNodeById(fileTree, nodeId)
    if (node?.type === 'folder') {
      setFileTree(fileTreeOperations.updateNode(fileTree, nodeId, { expanded: !node.expanded }))
    }
  }

  const handleSaveFile = () => {
    if (!fileTree || !selectedFileId) return
    setFileTree(fileTreeOperations.updateNode(fileTree, selectedFileId, { content: fileContent }))
    toast.success(`Saved ${selectedFile?.name || 'file'}`)
  }

  const handleDeleteFile = () => {
    if (!fileTree || !selectedFileId) return
    setFileTree(fileTreeOperations.deleteNode(fileTree, selectedFileId))
    setSelectedFileId(null)
    setFileContent('')
    toast.success(`Deleted ${selectedFile?.name || 'file'}`)
  }

  const handleCreateItem = () => {
    if (!newItemName.trim() || !fileTree) {
      toast.error('Please enter a name')
      return
    }

    const parentNode = activeFolderId
      ? fileTreeOperations.findNodeById(fileTree, activeFolderId)
      : null

    const exportPath = parentNode?.exportPath
      ? appendExportPath(parentNode.exportPath, newItemName)
      : undefined

    const newNode =
      newItemType === 'file'
        ? fileTreeOperations.createFileNode({ name: newItemName, exportPath })
        : fileTreeOperations.createFolderNode({ name: newItemName, exportPath, expanded: true })

    setFileTree(fileTreeOperations.appendNode(fileTree, activeFolderId, newNode))
    setNewItemName('')
    setShowNewItemDialog(false)

    if (newNode.type === 'file') {
      setSelectedFileId(newNode.id)
      setFileContent(newNode.content ?? '')
    }

    toast.success(`Created ${newNode.name}`)
  }

  const handleRunCode = () => {
    setIsRunning(true)
    setConsoleOutput(current => [...current, `> Running ${selectedFile?.name || 'code'}...`])

    setTimeout(() => {
      setConsoleOutput(current => [
        ...current,
        'OK Code executed successfully',
        '> Output: Hello from MetaBuilder IDE!',
      ])
      setIsRunning(false)
      toast.success('Code executed')
    }, 1000)
  }

  const handleRunTests = () => {
    setConsoleOutput(current => [...current, '> Running test suite...'])

    const mockTests: TestResult[] = [
      { name: 'Feed component renders', status: 'passed', duration: 45 },
      { name: 'Package export bundles files', status: 'passed', duration: 123 },
      { name: 'Lua manifest loads', status: 'passed', duration: 234 },
      { name: 'Permissions hook', status: 'passed', duration: 67 },
    ]

    setTimeout(() => {
      setTestResults(mockTests)
      setConsoleOutput(current => [
        ...current,
        `OK ${mockTests.filter(test => test.status === 'passed').length} tests passed`,
        `FAIL ${mockTests.filter(test => test.status === 'failed').length} tests failed`,
      ])
      toast.success('Tests completed')
    }, 1500)
  }

  const handleGitPush = () => {
    if (!gitConfig) {
      toast.error('Please configure Git first')
      setShowGitDialog(true)
      return
    }

    if (!gitCommitMessage.trim()) {
      toast.error('Please enter a commit message')
      return
    }

    setConsoleOutput(current => [
      ...current,
      `> git add .`,
      `> git commit -m "${gitCommitMessage}"`,
      `> git push origin ${gitConfig.branch}`,
    ])

    setTimeout(() => {
      setConsoleOutput(current => [
        ...current,
        `OK Pushed to ${gitConfig.provider} (${gitConfig.repoUrl})`,
      ])
      setGitCommitMessage('')
      toast.success('Changes pushed to repository')
    }, 1000)
  }

  const handleGitPull = () => {
    if (!gitConfig) {
      toast.error('Please configure Git first')
      setShowGitDialog(true)
      return
    }

    setConsoleOutput(current => [...current, `> git pull origin ${gitConfig.branch}`])

    setTimeout(() => {
      setConsoleOutput(current => [...current, `OK Pulled latest changes from ${gitConfig.branch}`])
      toast.success('Repository updated')
    }, 1000)
  }

  const handleExportZip = async () => {
    if (!fileTree || fileTree.length === 0) {
      toast.error('No files to export')
      return
    }

    try {
      const blob = await buildZipFromFileTree(fileTree)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${workspaceName || 'workspace'}.zip`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Zip exported')
    } catch (error) {
      toast.error('Failed to export zip')
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = getPackageTemplateById(templateId)
    if (!template) return

    setFileTree(template.tree)
    setWorkspaceName(template.rootName)
    setActiveFolderId(template.tree[0]?.id ?? null)
    const firstFile = fileTreeOperations.findFirstFile(template.tree)
    setSelectedFileId(firstFile?.id ?? null)
    setFileContent(firstFile?.content ?? '')
    setShowTemplateDialog(false)
    toast.success(`Loaded ${template.name}`)
  }

  const handleUpdateGitConfig = (updates: Partial<GitConfig>) => {
    setGitConfig(current => ({
      provider: current?.provider ?? 'github',
      repoUrl: current?.repoUrl ?? '',
      branch: current?.branch ?? 'main',
      token: current?.token ?? '',
      ...updates,
    }))
  }

  return {
    activeFolderId,
    consoleOutput,
    fileContent,
    fileTree,
    gitCommitMessage,
    gitConfig,
    isRunning,
    newItemName,
    newItemType,
    selectedFile,
    selectedFileId,
    showGitDialog,
    showNewItemDialog,
    showTemplateDialog,
    templates,
    testResults,
    workspaceName,
    handleCreateItem,
    handleDeleteFile,
    handleExportZip,
    handleGitPull,
    handleGitPush,
    handleRunCode,
    handleRunTests,
    handleSaveFile,
    handleTemplateSelect,
    handleToggleFolder,
    handleUpdateGitConfig,
    setActiveFolderId,
    setConsoleOutput,
    setFileContent,
    setGitCommitMessage,
    setNewItemName,
    setNewItemType,
    setSelectedFileId,
    setShowGitDialog,
    setShowNewItemDialog,
    setShowTemplateDialog,
  }
}
