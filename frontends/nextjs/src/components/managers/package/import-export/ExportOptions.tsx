import { Checkbox, Label } from '@/components/ui'
import type { ExportPackageOptions } from '@/lib/packages/core/package-export'

const exportOptionLabels: { key: keyof ExportPackageOptions; label: string }[] = [
  { key: 'includeSchemas', label: 'Include data schemas' },
  { key: 'includePages', label: 'Include page configurations' },
  { key: 'includeWorkflows', label: 'Include workflows' },
  { key: 'includeLuaScripts', label: 'Include Lua scripts' },
  { key: 'includeComponentHierarchy', label: 'Include component hierarchies' },
  { key: 'includeComponentConfigs', label: 'Include component configurations' },
  { key: 'includeCssClasses', label: 'Include CSS classes' },
  { key: 'includeDropdownConfigs', label: 'Include dropdown configurations' },
  { key: 'includeSeedData', label: 'Include seed data' },
  { key: 'includeAssets', label: 'Include assets (images, videos, audio, documents)' },
]

interface ExportOptionsProps {
  exportOptions: ExportPackageOptions
  setExportOptions: React.Dispatch<React.SetStateAction<ExportPackageOptions>>
}

export function ExportOptions({ exportOptions, setExportOptions }: ExportOptionsProps) {
  return (
    <div>
      <Label className="mb-3 block">Export Options</Label>
      <div className="space-y-3">
        {exportOptionLabels.map(({ key, label }) => (
          <div className="flex items-center gap-2" key={key}>
            <Checkbox
              id={`export-${key}`}
              checked={exportOptions[key] as boolean}
              onCheckedChange={checked => setExportOptions(prev => ({ ...prev, [key]: checked as boolean }))}
            />
            <Label htmlFor={`export-${key}`} className="font-normal cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
