import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui'

import { NerdModeIDEHeader } from '../components/NerdModeIDEHeader'
import { GitConfigDialog } from '../dialogs/GitConfigDialog'
import { NewItemDialog } from '../dialogs/NewItemDialog'
import { TemplateDialog } from '../dialogs/TemplateDialog'
import { EditorPane } from './NerdModeIDE/EditorPane'
import { Sidebar } from './NerdModeIDE/Sidebar'
import { useNerdIdeState } from './NerdModeIDE/useNerdIdeState'

interface NerdModeIDEProps {
  className?: string
}

export function NerdModeIDE({ className }: NerdModeIDEProps) {
  const {
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
  } = useNerdIdeState()

  return (
    <div className={className}>
      <Card className="h-full border-accent">
        <NerdModeIDEHeader
          workspaceName={workspaceName}
          onOpenGitConfig={() => setShowGitDialog(true)}
          onOpenTemplates={() => setShowTemplateDialog(true)}
          onOpenNewItem={() => setShowNewItemDialog(true)}
          onExportZip={handleExportZip}
        />
        <CardContent className="p-0">
          <div className="grid grid-cols-4 h-[calc(100vh-200px)]">
            <Sidebar
              nodes={fileTree || []}
              selectedFileId={selectedFileId}
              activeFolderId={activeFolderId}
              onToggleFolder={handleToggleFolder}
              onSelectFile={setSelectedFileId}
              onSelectFolder={setActiveFolderId}
            />
            <EditorPane
              selectedFile={selectedFile && selectedFile.type === 'file' ? selectedFile : null}
              fileContent={fileContent}
              isRunning={isRunning}
              consoleOutput={consoleOutput}
              testResults={testResults}
              gitConfig={gitConfig}
              gitCommitMessage={gitCommitMessage}
              onFileChange={setFileContent}
              onRunCode={handleRunCode}
              onSaveFile={handleSaveFile}
              onDeleteFile={handleDeleteFile}
              onClearConsole={() => setConsoleOutput([])}
              onRunTests={handleRunTests}
              onCommitMessageChange={setGitCommitMessage}
              onGitPush={handleGitPush}
              onGitPull={handleGitPull}
              onOpenGitConfig={() => setShowGitDialog(true)}
            />
          </div>
        </CardContent>
      </Card>

      <GitConfigDialog
        open={showGitDialog}
        gitConfig={gitConfig}
        onUpdate={handleUpdateGitConfig}
        onClose={() => setShowGitDialog(false)}
        onSave={() => {
          setShowGitDialog(false)
          toast.success('Git configuration saved')
        }}
      />

      <NewItemDialog
        open={showNewItemDialog}
        newItemName={newItemName}
        newItemType={newItemType}
        onNameChange={setNewItemName}
        onTypeChange={setNewItemType}
        onClose={() => setShowNewItemDialog(false)}
        onCreate={handleCreateItem}
      />

      <TemplateDialog
        open={showTemplateDialog}
        templates={templates}
        onSelectTemplate={handleTemplateSelect}
        onClose={() => setShowTemplateDialog(false)}
      />
    </div>
  )
}
