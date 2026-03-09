import React, { useState } from 'react'
import { Button } from '@metabuilder/fakemui/inputs'
import { Input } from '@metabuilder/fakemui/inputs'
import { Textarea } from '@metabuilder/fakemui/inputs'
import { Select } from '@metabuilder/fakemui/inputs'
import type { SelectChangeEvent } from '@metabuilder/fakemui/inputs'
import { MenuItem } from '@metabuilder/fakemui/navigation'
import { Label } from '@metabuilder/fakemui/atoms'
import { Tabs, Tab, TabPanel } from '@metabuilder/fakemui/navigation'
import { Dialog } from '@metabuilder/fakemui/feedback'
import { DialogContent, DialogHeader, DialogTitle } from '@metabuilder/fakemui/utils'
import { Sparkle, Plus } from '@metabuilder/fakemui/icons'
import { ProjectFile } from '@/types/project'
import fileExplorerCopy from '@/data/file-explorer.json'
import { useFileExplorerDialog } from '@/components/file-explorer/useFileExplorerDialog'

interface FileExplorerDialogProps {
  onFileAdd: (file: ProjectFile) => void
}

export function FileExplorerDialog({ onFileAdd }: FileExplorerDialogProps) {
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

  const [activeTab, setActiveTab] = useState<string>('manual')

  const handleTabChange = (_event: React.SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <>
      <Button
        size="small"
        variant="text"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus size={14} />
      </Button>
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{fileExplorerCopy.dialog.title}</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab value="manual" label={fileExplorerCopy.dialog.tabs.manual} />
            <Tab
              value="ai"
              label={
                <>
                  <Sparkle size={14} weight="duotone" />
                  {fileExplorerCopy.dialog.tabs.ai}
                </>
              }
            />
          </Tabs>
          <TabPanel value={activeTab} index="manual">
            <div>
              <Label>{fileExplorerCopy.dialog.fields.fileName}</Label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder={fileExplorerCopy.dialog.placeholders.manualFileName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddFile()
                }}
              />
            </div>
            <div>
              <Label>{fileExplorerCopy.dialog.fields.language}</Label>
              <Select
                value={newFileLanguage}
                onChange={(e: SelectChangeEvent) => setNewFileLanguage(e.target.value as string)}
              >
                <MenuItem value="typescript">
                  {fileExplorerCopy.options.languages.typescript}
                </MenuItem>
                <MenuItem value="javascript">
                  {fileExplorerCopy.options.languages.javascript}
                </MenuItem>
                <MenuItem value="css">{fileExplorerCopy.options.languages.css}</MenuItem>
                <MenuItem value="json">{fileExplorerCopy.options.languages.json}</MenuItem>
                <MenuItem value="prisma">{fileExplorerCopy.options.languages.prisma}</MenuItem>
              </Select>
            </div>
            <Button onClick={handleAddFile} variant="filled">
              {fileExplorerCopy.dialog.buttons.addFile}
            </Button>
          </TabPanel>
          <TabPanel value={activeTab} index="ai">
            <div>
              <Label>{fileExplorerCopy.dialog.fields.fileName}</Label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder={fileExplorerCopy.dialog.placeholders.aiFileName}
              />
            </div>
            <div>
              <Label>{fileExplorerCopy.dialog.fields.fileType}</Label>
              <Select
                value={aiFileType}
                onChange={(e: SelectChangeEvent) => setAiFileType(e.target.value as any)}
              >
                <MenuItem value="component">
                  {fileExplorerCopy.options.fileTypes.component}
                </MenuItem>
                <MenuItem value="page">{fileExplorerCopy.options.fileTypes.page}</MenuItem>
                <MenuItem value="api">{fileExplorerCopy.options.fileTypes.api}</MenuItem>
                <MenuItem value="utility">{fileExplorerCopy.options.fileTypes.utility}</MenuItem>
              </Select>
            </div>
            <div>
              <Label>{fileExplorerCopy.dialog.fields.description}</Label>
              <Textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder={fileExplorerCopy.dialog.placeholders.description}
                rows={4}
              />
            </div>
            <div>
              <Label>{fileExplorerCopy.dialog.fields.language}</Label>
              <Select
                value={newFileLanguage}
                onChange={(e: SelectChangeEvent) => setNewFileLanguage(e.target.value as string)}
              >
                <MenuItem value="typescript">
                  {fileExplorerCopy.options.languages.typescript}
                </MenuItem>
                <MenuItem value="javascript">
                  {fileExplorerCopy.options.languages.javascript}
                </MenuItem>
              </Select>
            </div>
            <Button onClick={handleGenerateFileWithAI} variant="filled" disabled={isGenerating}>
              {isGenerating ? (
                fileExplorerCopy.dialog.buttons.generating
              ) : (
                <>
                  <Sparkle size={16} weight="duotone" />
                  {fileExplorerCopy.dialog.buttons.generate}
                </>
              )}
            </Button>
          </TabPanel>
        </DialogContent>
      </Dialog>
    </>
  )
}
