import { Button } from '@metabuilder/fakemui/inputs'
import { Input } from '@metabuilder/fakemui/inputs'
import { Select } from '@metabuilder/fakemui/inputs'
import type {
  SelectChangeEvent,
} from '@metabuilder/fakemui/inputs'
import { MenuItem } from '@metabuilder/fakemui/navigation'
import { Label } from '@metabuilder/fakemui/atoms'
import fileExplorerCopy from '@/data/file-explorer.json'

export function ManualFileTab({
  newFileName,
  setNewFileName,
  newFileLanguage,
  setNewFileLanguage,
  onAddFile,
}: {
  newFileName: string
  setNewFileName: (v: string) => void
  newFileLanguage: string
  setNewFileLanguage: (v: string) => void
  onAddFile: () => void
}) {
  const c = fileExplorerCopy
  return (
    <div>
      <div>
        <Label>
          {c.dialog.fields.fileName}
        </Label>
        <Input
          value={newFileName}
          onChange={(e) =>
            setNewFileName(e.target.value)
          }
          placeholder={
            c.dialog.placeholders.manualFileName
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAddFile()
          }}
        />
      </div>
      <div>
        <Label>
          {c.dialog.fields.language}
        </Label>
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
          <MenuItem value="css">
            {c.options.languages.css}
          </MenuItem>
          <MenuItem value="json">
            {c.options.languages.json}
          </MenuItem>
          <MenuItem value="prisma">
            {c.options.languages.prisma}
          </MenuItem>
        </Select>
      </div>
      <Button onClick={onAddFile} variant="filled">
        {c.dialog.buttons.addFile}
      </Button>
    </div>
  )
}
