"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Snippet } from '@/lib/types'
import { strings, appConfig } from '@/lib/config'
import { useSnippetForm } from '@/hooks/useSnippetForm'
import { SnippetFormFields } from '@/components/features/snippet-editor/SnippetFormFields'
import { CodeEditorSection } from '@/components/features/snippet-editor/CodeEditorSection'
import { InputParameterList } from '@/components/features/snippet-editor/InputParameterList'

interface SnippetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingSnippet?: Snippet | null
}

export function SnippetDialog({ open, onOpenChange, onSave, editingSnippet }: SnippetDialogProps) {
  const {
    title,
    description,
    language,
    code,
    hasPreview,
    functionName,
    inputParameters,
    errors,
    setTitle,
    setDescription,
    setLanguage,
    setCode,
    setHasPreview,
    setFunctionName,
    handleAddParameter,
    handleRemoveParameter,
    handleUpdateParameter,
    validate,
    getFormData,
    resetForm,
  } = useSnippetForm(editingSnippet, open)

  const handleSave = () => {
    if (!validate()) {
      return
    }

    onSave(getFormData())
    resetForm()
    onOpenChange(false)
  }

  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(language)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col"
        data-testid="snippet-dialog"
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-2xl">
            {editingSnippet?.id ? strings.snippetDialog.edit.title : strings.snippetDialog.create.title}
          </DialogTitle>
          <DialogDescription>
            {editingSnippet?.id
              ? strings.snippetDialog.edit.description
              : strings.snippetDialog.create.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <SnippetFormFields
            title={title}
            description={description}
            language={language}
            errors={errors}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onLanguageChange={setLanguage}
          />

          <CodeEditorSection
            code={code}
            language={language}
            hasPreview={hasPreview}
            functionName={functionName}
            inputParameters={inputParameters}
            errors={errors}
            onCodeChange={setCode}
            onPreviewChange={setHasPreview}
          />

          {hasPreview && isPreviewSupported && (
            <InputParameterList
              inputParameters={inputParameters}
              functionName={functionName}
              onFunctionNameChange={setFunctionName}
              onAddParameter={handleAddParameter}
              onRemoveParameter={handleRemoveParameter}
              onUpdateParameter={handleUpdateParameter}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="snippet-dialog-cancel-btn"
            aria-label="Cancel editing snippet"
          >
            {strings.snippetDialog.buttons.cancel}
          </Button>
          <Button
            onClick={handleSave}
            data-testid="snippet-dialog-save-btn"
            aria-label={editingSnippet ? "Update snippet" : "Create new snippet"}
          >
            {editingSnippet ? strings.snippetDialog.buttons.update : strings.snippetDialog.buttons.create} Snippet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
