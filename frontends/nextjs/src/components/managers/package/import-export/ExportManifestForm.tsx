import type React from 'react'
import { Button, Input, Label, Textarea } from '@/components/ui'
import type { PackageManifest } from '@/lib/package-types'

interface ExportManifestFormProps {
  manifest: Partial<PackageManifest>
  setManifest: React.Dispatch<React.SetStateAction<Partial<PackageManifest>>>
  tagInput: string
  setTagInput: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
}

export function ExportManifestForm({
  manifest,
  setManifest,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
}: ExportManifestFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="package-name">Package Name *</Label>
        <Input
          id="package-name"
          placeholder="My Awesome Package"
          value={manifest.name}
          onChange={e => setManifest(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="package-version">Version</Label>
          <Input
            id="package-version"
            placeholder="1.0.0"
            value={manifest.version}
            onChange={e => setManifest(prev => ({ ...prev, version: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="package-author">Author</Label>
          <Input
            id="package-author"
            placeholder="Your Name"
            value={manifest.author}
            onChange={e => setManifest(prev => ({ ...prev, author: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="package-description">Description</Label>
        <Textarea
          id="package-description"
          placeholder="Describe what this package does..."
          value={manifest.description}
          onChange={e => setManifest(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="package-tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="package-tags"
            placeholder="Add a tag..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
          />
          <Button type="button" onClick={onAddTag}>
            Add
          </Button>
        </div>
        {manifest.tags && manifest.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {manifest.tags.map(tag => (
              <div key={tag} className="px-2 py-1 bg-secondary rounded-md text-sm flex items-center gap-2">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
