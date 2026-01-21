'use client'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MonacoEditor } from '@/components/features/snippet-editor/MonacoEditor'
import { SplitScreenEditor } from '@/components/features/snippet-editor/SplitScreenEditor'
import { InputParameter } from '@/lib/types'
import { appConfig } from '@/lib/config'

interface CodeEditorSectionProps {
  code: string
  language: string
  hasPreview: boolean
  functionName: string
  inputParameters: InputParameter[]
  errors: { code?: string }
  onCodeChange: (value: string) => void
  onPreviewChange: (checked: boolean) => void
}

export function CodeEditorSection({
  code,
  language,
  hasPreview,
  functionName,
  inputParameters,
  errors,
  onCodeChange,
  onPreviewChange,
}: CodeEditorSectionProps) {
  const isPreviewSupported = appConfig.previewEnabledLanguages.includes(language)

  return (
    <>
      {isPreviewSupported && (
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="hasPreview"
            checked={hasPreview}
            onCheckedChange={(checked) => onPreviewChange(checked as boolean)}
            data-testid="enable-preview-checkbox"
            aria-label="Enable live preview"
          />
          <Label
            htmlFor="hasPreview"
            className="text-sm font-normal cursor-pointer"
            data-testid="enable-preview-label"
          >
            Enable live preview
          </Label>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">Code *</Label>
        {hasPreview && isPreviewSupported ? (
          <div
            className={errors.code ? 'ring-2 ring-destructive/20 rounded-md' : ''}
            data-testid="split-screen-editor-container"
            role="region"
            aria-label="Code editor with split screen view"
          >
            <SplitScreenEditor
              value={code}
              onChange={onCodeChange}
              language={language}
              height="500px"
              functionName={functionName}
              inputParameters={inputParameters}
            />
          </div>
        ) : (
          <div
            className={`rounded-md border overflow-hidden ${
              errors.code ? 'border-destructive ring-2 ring-destructive/20' : 'border-border'
            }`}
            data-testid="code-editor-container"
            role="region"
            aria-label="Code editor"
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? "code-error" : undefined}
          >
            <MonacoEditor value={code} onChange={onCodeChange} language={language} height="400px" />
          </div>
        )}
        {errors.code && (
          <p className="text-sm text-destructive" id="code-error" data-testid="code-error-message" role="alert">
            {errors.code}
          </p>
        )}
      </div>
    </>
  )
}
