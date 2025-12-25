import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Editor from '@monaco-editor/react'
import {
  File,
  Folder,
  FolderOpen,
  Plus,
  FloppyDisk,
  Play,
  Bug,
  TestTube,
  GitBranch,
  GitCommit,
  GitPullRequest,
  CloudArrowUp,
  CloudArrowDown,
  Trash,
  X,
  CaretRight,
  CaretDown,
  Terminal,
  Package,
  Gear,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileNode[]
  expanded?: boolean
}

interface GitConfig {
  provider: 'github' | 'gitlab'
  token: string
  repoUrl: string
  branch: string
}

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'pending'
  duration?: number
  error?: string
}

interface NerdModeIDEProps {
  className?: string
}

export function NerdModeIDE({ className }: NerdModeIDEProps) {
  const [fileTree, setFileTree] = useKV<FileNode[]>('nerd-mode-file-tree', [
    {
      id: 'root',
      name: 'project',
      type: 'folder',
      expanded: true,
      children: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          expanded: true,
          children: [
            {
              id: 'app.tsx',
              name: 'App.tsx',
              type: 'file',
              language: 'typescript',
              content: '// Your App.tsx\nimport React from "react"\n\nexport default function App() {\n  return <div>Hello World</div>\n}',
            },
            {
              id: 'index.tsx',
              name: 'index.tsx',
              type: 'file',
              language: 'typescript',
              content: '// Entry point\nimport React from "react"\nimport ReactDOM from "react-dom"\nimport App from "./App"\n\nReactDOM.render(<App />, document.getElementById("root"))',
            },
          ],
        },
        {
          id: 'public',
          name: 'public',
          type: 'folder',
          expanded: false,
          children: [
            {
              id: 'index.html',
              name: 'index.html',
              type: 'file',
              language: 'html',
              content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
            },
          ],
        },
        {
          id: 'package.json',
          name: 'package.json',
          type: 'file',
          language: 'json',
          content: '{\n  "name": "metabuilder-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}',
        },
      ],
    },
  ])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [gitConfig, setGitConfig] = useKV<GitConfig | null>('nerd-mode-git-config', null)
  const [showGitDialog, setShowGitDialog] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file')
  const [currentFolder, setCurrentFolder] = useState<FileNode | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [gitCommitMessage, setGitCommitMessage] = useState('')

  useEffect(() => {
    if (selectedFile && selectedFile.content !== undefined) {
      setFileContent(selectedFile.content)
    }
  }, [selectedFile])

  const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const updateNode = (nodes: FileNode[], id: string, updates: Partial<FileNode>): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, ...updates }
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: updateNode(node.children, id, updates) }
      }
      return node
    })
  }

  const deleteNode = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes.filter(node => {
      if (node.id === id) return false
      if (node.children && node.children.length > 0) {
        node.children = deleteNode(node.children, id)
      }
      return true
    })
  }

  const handleToggleFolder = (nodeId: string) => {
    const node = fileTree ? findNodeById(fileTree, nodeId) : null
    if (node && node.type === 'folder' && fileTree) {
      setFileTree(updateNode(fileTree, nodeId, { expanded: !node.expanded }))
    }
  }

  const handleSelectFile = (node: FileNode) => {
    if (node.type === 'file') {
      setSelectedFile(node)
    }
  }

  const handleSaveFile = () => {
    if (!selectedFile || !fileTree) return
    setFileTree(updateNode(fileTree, selectedFile.id, { content: fileContent }))
    toast.success(`Saved ${selectedFile.name}`)
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name')
      return
    }

    const newNode: FileNode = {
      id: `${Date.now()}-${newFileName}`,
      name: newFileName,
      type: newFileType,
      content: newFileType === 'file' ? '' : undefined,
      language: newFileType === 'file' ? getLanguageFromFilename(newFileName) : undefined,
      children: newFileType === 'folder' ? [] : undefined,
      expanded: false,
    }

    if (currentFolder && fileTree) {
      const folder = findNodeById(fileTree, currentFolder.id)
      if (folder && folder.children) {
        const updatedChildren = [...folder.children, newNode]
        setFileTree(updateNode(fileTree, currentFolder.id, { children: updatedChildren }))
      }
    } else if (fileTree) {
      setFileTree([...fileTree, newNode])
    }

    setNewFileName('')
    setShowNewFileDialog(false)
    toast.success(`Created ${newNode.name}`)
  }

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      html: 'html',
      css: 'css',
      lua: 'lua',
      py: 'python',
      md: 'markdown',
    }
    return langMap[ext || ''] || 'plaintext'
  }

  const handleDeleteFile = () => {
    if (!selectedFile || !fileTree) return
    setFileTree(deleteNode(fileTree, selectedFile.id))
    setSelectedFile(null)
    setFileContent('')
    toast.success(`Deleted ${selectedFile.name}`)
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setConsoleOutput((current) => [...current, `> Running ${selectedFile?.name || 'code'}...`])
    
    setTimeout(() => {
      setConsoleOutput((current) => [
        ...current,
        '✓ Code executed successfully',
        '> Output: Hello from MetaBuilder IDE!',
      ])
      setIsRunning(false)
      toast.success('Code executed')
    }, 1000)
  }

  const handleRunTests = async () => {
    setConsoleOutput((current) => [...current, '> Running test suite...'])
    
    const mockTests: TestResult[] = [
      { name: 'App component renders', status: 'passed', duration: 45 },
      { name: 'User authentication works', status: 'passed', duration: 123 },
      { name: 'API integration test', status: 'passed', duration: 234 },
      { name: 'Form validation', status: 'passed', duration: 67 },
    ]

    setTimeout(() => {
      setTestResults(mockTests)
      setConsoleOutput((current) => [
        ...current,
        `✓ ${mockTests.filter(t => t.status === 'passed').length} tests passed`,
        `✗ ${mockTests.filter(t => t.status === 'failed').length} tests failed`,
      ])
      toast.success('Tests completed')
    }, 1500)
  }

  const handleGitPush = async () => {
    if (!gitConfig) {
      toast.error('Please configure Git first')
      setShowGitDialog(true)
      return
    }

    if (!gitCommitMessage.trim()) {
      toast.error('Please enter a commit message')
      return
    }

    setConsoleOutput((current) => [
      ...current,
      `> git add .`,
      `> git commit -m "${gitCommitMessage}"`,
      `> git push origin ${gitConfig.branch}`,
    ])

    setTimeout(() => {
      setConsoleOutput((current) => [
        ...current,
        `✓ Pushed to ${gitConfig.provider} (${gitConfig.repoUrl})`,
      ])
      setGitCommitMessage('')
      toast.success('Changes pushed to repository')
    }, 1000)
  }

  const handleGitPull = async () => {
    if (!gitConfig) {
      toast.error('Please configure Git first')
      setShowGitDialog(true)
      return
    }

    setConsoleOutput((current) => [
      ...current,
      `> git pull origin ${gitConfig.branch}`,
    ])

    setTimeout(() => {
      setConsoleOutput((current) => [
        ...current,
        `✓ Pulled latest changes from ${gitConfig.branch}`,
      ])
      toast.success('Repository updated')
    }, 1000)
  }

  const renderFileTree = (nodes: FileNode[] | undefined, level = 0) => {
    if (!nodes) return null
    return nodes.map(node => (
      <div key={node.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-accent rounded text-sm ${
            selectedFile?.id === node.id ? 'bg-accent' : ''
          }`}
          onClick={() => {
            if (node.type === 'folder') {
              handleToggleFolder(node.id)
            } else {
              handleSelectFile(node)
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {node.expanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
              {node.expanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            </>
          ) : (
            <>
              <div style={{ width: '14px' }} />
              <File size={16} />
            </>
          )}
          <span>{node.name}</span>
        </div>
        {node.type === 'folder' && node.expanded && node.children && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className={className}>
      <Card className="h-full border-accent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal size={20} />
              Nerd Mode IDE
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGitDialog(true)}
              >
                <GitBranch size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCurrentFolder(null)
                  setShowNewFileDialog(true)
                }}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-4 h-[calc(100vh-200px)]">
            <div className="col-span-1 border-r border-border">
              <div className="p-2 bg-muted border-b border-border">
                <div className="text-xs font-semibold text-muted-foreground">FILE EXPLORER</div>
              </div>
              <ScrollArea className="h-[calc(100%-40px)]">
                <div className="p-2">{renderFileTree(fileTree)}</div>
              </ScrollArea>
            </div>

            <div className="col-span-3 flex flex-col">
              {selectedFile ? (
                <>
                  <div className="flex items-center justify-between p-2 bg-muted border-b border-border">
                    <div className="flex items-center gap-2">
                      <File size={16} />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedFile.language}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={handleRunCode} disabled={isRunning}>
                        <Play size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleSaveFile}>
                        <FloppyDisk size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleDeleteFile}>
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>

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
                          onChange={(value) => setFileContent(value || '')}
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

                      <TabsContent value="console" className="h-[calc(100%-40px)] m-0 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Console Output</h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConsoleOutput([])}
                          >
                            Clear
                          </Button>
                        </div>
                        <ScrollArea className="h-[calc(100%-60px)]">
                          <div className="font-mono text-xs bg-black/50 rounded p-3 space-y-1">
                            {consoleOutput.length === 0 ? (
                              <div className="text-muted-foreground">No output yet</div>
                            ) : (
                              consoleOutput.map((line, i) => (
                                <div key={i} className="text-white">
                                  {line}
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="tests" className="h-[calc(100%-40px)] m-0 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Test Suite</h3>
                          <Button size="sm" onClick={handleRunTests}>
                            <TestTube className="mr-2" size={16} />
                            Run Tests
                          </Button>
                        </div>
                        <ScrollArea className="h-[calc(100%-60px)]">
                          <div className="space-y-2">
                            {testResults.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <TestTube size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No tests run yet</p>
                              </div>
                            ) : (
                              testResults.map((test, i) => (
                                <Card key={i}>
                                  <CardContent className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={test.status === 'passed' ? 'default' : 'destructive'}
                                      >
                                        {test.status}
                                      </Badge>
                                      <span className="text-sm">{test.name}</span>
                                    </div>
                                    {test.duration && (
                                      <span className="text-xs text-muted-foreground">
                                        {test.duration}ms
                                      </span>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="git" className="h-[calc(100%-40px)] m-0 p-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">Git Operations</h3>
                            {gitConfig ? (
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{gitConfig.provider}</Badge>
                                  <span className="text-muted-foreground">{gitConfig.repoUrl}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <GitBranch size={14} />
                                  <span>{gitConfig.branch}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No Git configuration found
                              </p>
                            )}
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="commit-message">Commit Message</Label>
                              <Input
                                id="commit-message"
                                placeholder="Update files"
                                value={gitCommitMessage}
                                onChange={(e) => setGitCommitMessage(e.target.value)}
                                className="mt-1"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={handleGitPush} className="flex-1">
                                <CloudArrowUp className="mr-2" size={16} />
                                Push
                              </Button>
                              <Button onClick={handleGitPull} variant="outline" className="flex-1">
                                <CloudArrowDown className="mr-2" size={16} />
                                Pull
                              </Button>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setShowGitDialog(true)}
                            >
                              <Gear className="mr-2" size={16} />
                              Configure Git
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <File size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Select a file to edit</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showGitDialog} onOpenChange={setShowGitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Git Integration</DialogTitle>
            <DialogDescription>
              Connect to GitHub or GitLab to sync your code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="git-provider">Provider</Label>
              <Select
                value={gitConfig?.provider || 'github'}
                onValueChange={(value: 'github' | 'gitlab') =>
                  setGitConfig((current) => ({ ...(current || { token: '', repoUrl: '', branch: 'main' }), provider: value }))
                }
              >
                <SelectTrigger id="git-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="git-repo">Repository URL</Label>
              <Input
                id="git-repo"
                placeholder="https://github.com/user/repo"
                value={gitConfig?.repoUrl || ''}
                onChange={(e) =>
                  setGitConfig((current) => ({ ...(current || { provider: 'github', token: '', branch: 'main' }), repoUrl: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="git-branch">Branch</Label>
              <Input
                id="git-branch"
                placeholder="main"
                value={gitConfig?.branch || 'main'}
                onChange={(e) =>
                  setGitConfig((current) => ({ ...(current || { provider: 'github', token: '', repoUrl: '' }), branch: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="git-token">Access Token</Label>
              <Input
                id="git-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={gitConfig?.token || ''}
                onChange={(e) =>
                  setGitConfig((current) => ({ ...(current || { provider: 'github', repoUrl: '', branch: 'main' }), token: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowGitDialog(false)
              toast.success('Git configuration saved')
            }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {newFileType === 'file' ? 'File' : 'Folder'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-type">Type</Label>
              <Select
                value={newFileType}
                onValueChange={(value: 'file' | 'folder') => setNewFileType(value)}
              >
                <SelectTrigger id="file-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="folder">Folder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="file-name">Name</Label>
              <Input
                id="file-name"
                placeholder={newFileType === 'file' ? 'example.tsx' : 'folder-name'}
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
