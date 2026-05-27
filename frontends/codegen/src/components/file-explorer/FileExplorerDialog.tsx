import React, { useState } from 'react'
import { Button } from '@metabuilder/fakemui/inputs'
import { Sparkle, Plus } from '@metabuilder/fakemui/icons'
import {
  Tabs,
  Tab,
  TabPanel,
} from '@metabuilder/fakemui/navigation'
import { Dialog } from '@metabuilder/fakemui/feedback'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@metabuilder/fakemui/utils'
import { ProjectFile } from '@/types/project'
import fileExplorerCopy from '@/data/file-explorer.json'
import { useFileExplorerDialog } from './useFileExplorerDialog'
import { ManualFileTab } from './ManualFileTab'
import { AIFileTab } from './AIFileTab'

export function FileExplorerDialog({
  onFileAdd,
}: {
  onFileAdd: (file: ProjectFile) => void
}) {
  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    newFileName,
    setNewFileName,
    newFileLanguage,
    setNewFileLanguage,
    aiDescription,
    setAiDescription,
    aiFileType,
    setAiFileType,
    isGenerating,
    handleAddFile,
    handleGenerateFileWithAI,
  } = useFileExplorerDialog({ onFileAdd })

  const [activeTab, setActiveTab] =
    useState<string>('manual')

  const handleTabChange = (
    _event: React.SyntheticEvent,
    value: string
  ) => setActiveTab(value)

  const c = fileExplorerCopy

  return (
    <>
      <Button
        size="small"
        variant="text"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus size={14} />
      </Button>
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {c.dialog.title}
            </DialogTitle>
          </DialogHeader>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab
              value="manual"
              label={c.dialog.tabs.manual}
            />
            <Tab
              value="ai"
              label={
                <>
                  <Sparkle
                    size={14}
                    weight="duotone"
                  />
                  {c.dialog.tabs.ai}
                </>
              }
            />
          </Tabs>
          <TabPanel value={activeTab} index="manual">
            <ManualFileTab
              newFileName={newFileName}
              setNewFileName={setNewFileName}
              newFileLanguage={newFileLanguage}
              setNewFileLanguage={
                setNewFileLanguage
              }
              onAddFile={handleAddFile}
            />
          </TabPanel>
          <TabPanel value={activeTab} index="ai">
            <AIFileTab
              newFileName={newFileName}
              setNewFileName={setNewFileName}
              newFileLanguage={newFileLanguage}
              setNewFileLanguage={
                setNewFileLanguage
              }
              aiDescription={aiDescription}
              setAiDescription={setAiDescription}
              aiFileType={aiFileType}
              setAiFileType={setAiFileType}
              isGenerating={isGenerating}
              onGenerate={handleGenerateFileWithAI}
            />
          </TabPanel>
        </DialogContent>
      </Dialog>
    </>
  )
}
