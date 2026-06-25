import { Button } from '@metabuilder/m3/inputs'
import { Input } from '@metabuilder/m3/inputs'
import { Textarea } from '@metabuilder/m3/inputs'
import { Select } from '@metabuilder/m3/inputs'
import type {
  SelectChangeEvent,
} from '@metabuilder/m3/inputs'
import { MenuItem } from '@metabuilder/m3/navigation'
import { Label } from '@metabuilder/m3/atoms'
import { Sparkle } from '@metabuilder/m3/icons'
import fileExplorerCopy from '@/data/file-explorer.json'

type AiFileType =
  | 'component'
  | 'page'
  | 'api'
  | 'utility'

export function AIFileTab({
  newFileName,
  setNewFileName,
  newFileLanguage,
  setNewFileLanguage,
  aiDescription,
  setAiDescription,
  aiFileType,
  setAiFileType,
  isGenerating,
  onGenerate,
}: {
  newFileName: string
  setNewFileName: (v: string) => void
  newFileLanguage: string
  setNewFileLanguage: (v: string) => void
  aiDescription: string
  setAiDescription: (v: string) => void
  aiFileType: AiFileType
  setAiFileType: (v: AiFileType) => void
  isGenerating: boolean
  onGenerate: () => void
}) {
  const c = fileExplorerCopy
  return (
    <div>
      <div>
        <Label>{c.dialog.fields.fileName}</Label>
        <Input
          value={newFileName}
          onChange={(e) =>
            setNewFileName(e.target.value)
          }
          placeholder={
            c.dialog.placeholders.aiFileName
          }
        />
      </div>
      <div>
        <Label>{c.dialog.fields.fileType}</Label>
        <Select
          value={aiFileType}
          onChange={(e: SelectChangeEvent) =>
            setAiFileType(
              e.target.value as AiFileType
            )
          }
        >
          <MenuItem value="component">
            {c.options.fileTypes.component}
          </MenuItem>
          <MenuItem value="page">
            {c.options.fileTypes.page}
          </MenuItem>
          <MenuItem value="api">
            {c.options.fileTypes.api}
          </MenuItem>
          <MenuItem value="utility">
            {c.options.fileTypes.utility}
          </MenuItem>
        </Select>
      </div>
      <div>
        <Label>
          {c.dialog.fields.description}
        </Label>
        <Textarea
          value={aiDescription}
          onChange={(e) =>
            setAiDescription(e.target.value)
          }
          placeholder={
            c.dialog.placeholders.description
          }
          rows={4}
        />
      </div>
      <div>
        <Label>{c.dialog.fields.language}</Label>
        <Select
          value={newFileLanguage}
          onChange={(e: SelectChangeEvent) =>
            setNewFileLanguage(
              e.target.value as string
            )
          }
        >
          <MenuItem value="typescript">
            {c.options.languages.typescript}
          </MenuItem>
          <MenuItem value="javascript">
            {c.options.languages.javascript}
          </MenuItem>
        </Select>
      </div>
      <Button
        onClick={onGenerate}
        variant="filled"
        disabled={isGenerating}
      >
        {isGenerating ? (
          c.dialog.buttons.generating
        ) : (
          <>
            <Sparkle
              size={16}
              weight="duotone"
            />
            {c.dialog.buttons.generate}
          </>
        )}
      </Button>
    </div>
  )
}
