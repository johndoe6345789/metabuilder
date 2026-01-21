import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FloppyDisk, Trash, PencilSimple, CheckCircle, Clock } from '@phosphor-icons/react'
import { useAppDispatch, useAppSelector } from '@/store'
import { saveFile, deleteFile, type FileItem } from '@/store/slices/filesSlice'
import { toast } from 'sonner'
import copy from '@/data/persistence-example.json'

type HeaderProps = {
  title: string
  description: string
}

const PersistenceExampleHeader = ({ title, description }: HeaderProps) => (
  <div>
    <h1 className="text-3xl font-bold mb-2">{title}</h1>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

type FileEditorCardProps = {
  fileName: string
  fileContent: string
  editingId: string | null
  onFileNameChange: (value: string) => void
  onFileContentChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

const FileEditorCard = ({
  fileName,
  fileContent,
  editingId,
  onFileNameChange,
  onFileContentChange,
  onSave,
  onCancel,
}: FileEditorCardProps) => (
  <Card className="p-6 space-y-4 border-sidebar-border">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        {editingId ? copy.editor.titleEdit : copy.editor.titleCreate}
      </h2>
      {editingId && (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          {copy.editor.editingBadge}
        </Badge>
      )}
    </div>
    <Separator />

    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fileName">{copy.editor.fileNameLabel}</Label>
        <Input
          id="fileName"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          placeholder={copy.editor.fileNamePlaceholder}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fileContent">{copy.editor.contentLabel}</Label>
        <textarea
          id="fileContent"
          value={fileContent}
          onChange={(e) => onFileContentChange(e.target.value)}
          placeholder={copy.editor.contentPlaceholder}
          className="w-full h-32 px-3 py-2 border border-input rounded-md bg-background font-mono text-sm resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} className="flex items-center gap-2 flex-1">
          <FloppyDisk />
          {editingId ? copy.editor.updateButton : copy.editor.saveButton}
        </Button>
        {editingId && (
          <Button onClick={onCancel} variant="outline">
            {copy.editor.cancelButton}
          </Button>
        )}
      </div>

      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <div className="flex items-start gap-2">
          <CheckCircle className="text-accent mt-1" weight="fill" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">{copy.info.automaticTitle}</p>
            <p className="text-muted-foreground">{copy.info.automaticDescription}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="text-primary mt-1" weight="fill" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">{copy.info.flaskTitle}</p>
            <p className="text-muted-foreground">{copy.info.flaskDescription}</p>
          </div>
        </div>
      </div>
    </div>
  </Card>
)

type SavedFilesCardProps = {
  files: FileItem[]
  onEdit: (file: FileItem) => void
  onDelete: (fileId: string, name: string) => void
}

const SavedFilesCard = ({ files, onEdit, onDelete }: SavedFilesCardProps) => (
  <Card className="p-6 space-y-4 border-sidebar-border">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">{copy.files.title}</h2>
      <Badge variant="secondary">
        {files.length} {copy.files.countLabel}
      </Badge>
    </div>
    <Separator />

    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{copy.files.emptyTitle}</p>
          <p className="text-sm mt-1">{copy.files.emptyDescription}</p>
        </div>
      ) : (
        files.map((file) => (
          <Card
            key={file.id}
            className="p-4 space-y-2 hover:bg-muted/50 transition-colors border-sidebar-border"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{file.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{file.path}</p>
              </div>
              <Badge variant="outline" className="ml-2 shrink-0">
                {file.language}
              </Badge>
            </div>

            {file.content && (
              <div className="bg-muted/50 p-2 rounded text-xs font-mono text-muted-foreground max-h-20 overflow-hidden">
                {file.content.substring(0, 100)}
                {file.content.length > 100 && '...'}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {copy.files.updatedLabel} {new Date(file.updatedAt).toLocaleTimeString()}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(file)}
                  className="h-8 flex items-center gap-1"
                >
                  <PencilSimple />
                  {copy.files.editButton}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(file.id, file.name)}
                  className="h-8 flex items-center gap-1 text-destructive hover:text-destructive"
                >
                  <Trash />
                  {copy.files.deleteButton}
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  </Card>
)

const HowItWorksCard = () => (
  <Card className="p-6 space-y-4 border-primary/50 bg-primary/5">
    <h3 className="text-lg font-semibold">{copy.howItWorks.title}</h3>
    <Separator />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      {copy.howItWorks.steps.map((step) => (
        <div className="space-y-2" key={step.title}>
          <div className="font-semibold text-primary">{step.title}</div>
          <p className="text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  </Card>
)

export function PersistenceExample() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.files.files)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSave = async () => {
    if (!fileName.trim()) {
      toast.error(copy.toasts.fileNameRequired)
      return
    }

    const fileItem: FileItem = {
      id: editingId || `file-${Date.now()}`,
      name: fileName,
      content: fileContent,
      language: 'javascript',
      path: `/src/${fileName}`,
      updatedAt: Date.now(),
    }

    try {
      await dispatch(saveFile(fileItem)).unwrap()
      toast.success(copy.toasts.saveSuccess.replace('{{name}}', fileName), {
        description: copy.toasts.saveDescription,
      })
      setFileName('')
      setFileContent('')
      setEditingId(null)
    } catch (error: any) {
      toast.error(copy.toasts.saveErrorTitle, {
        description: error,
      })
    }
  }

  const handleEdit = (file: FileItem) => {
    setEditingId(file.id)
    setFileName(file.name)
    setFileContent(file.content)
  }

  const handleDelete = async (fileId: string, name: string) => {
    try {
      await dispatch(deleteFile(fileId)).unwrap()
      toast.success(copy.toasts.deleteSuccess.replace('{{name}}', name), {
        description: copy.toasts.deleteDescription,
      })
    } catch (error: any) {
      toast.error(copy.toasts.deleteErrorTitle, {
        description: error,
      })
    }
  }

  const handleCancel = () => {
    setFileName('')
    setFileContent('')
    setEditingId(null)
  }

  return (
    <div className="p-6 space-y-6">
      <PersistenceExampleHeader title={copy.title} description={copy.description} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileEditorCard
          fileName={fileName}
          fileContent={fileContent}
          editingId={editingId}
          onFileNameChange={setFileName}
          onFileContentChange={setFileContent}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        <SavedFilesCard files={files} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <HowItWorksCard />
    </div>
  )
}
