import { FloppyDisk, X } from '@/fakemui/icons'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'

import { useClassBuilderState } from './class-builder/hooks'
import { Preview } from './class-builder/Preview'
import { RuleEditor } from './class-builder/RuleEditor'

interface CssClassBuilderProps {
  open: boolean
  onClose: () => void
  initialValue?: string
  onSave: (classes: string) => void
}

export function CssClassBuilder({
  open,
  onClose,
  initialValue = '',
  onSave,
}: CssClassBuilderProps) {
  const {
    categories,
    filteredCategories,
    selectedClasses,
    selectedClassSet,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    customClass,
    setCustomClass,
    invalidCustomTokens,
    duplicateCustomTokens,
    unknownCustomTokens,
    canAddCustom,
    addCustomClass,
    toggleClass,
    clearSelectedClasses,
  } = useClassBuilderState({ open, initialValue })

  const normalizedSearch = searchQuery.trim()
  const hasNoCategories = filteredCategories.length === 0 && categories.length === 0
  const hasNoSearchResults =
    filteredCategories.length === 0 && categories.length > 0 && normalizedSearch

  const handleSave = () => {
    onSave(selectedClasses.join(' '))
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">CSS Class Builder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {selectedClasses.length > 0 ? (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider">Selected Classes</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedClasses.length} selected
                  </span>
                  <Button size="sm" variant="ghost" onClick={clearSelectedClasses}>
                    Clear
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedClasses.map(cls => (
                  <Badge key={cls} variant="secondary" className="gap-2">
                    {cls}
                    <button onClick={() => toggleClass(cls)} className="hover:text-destructive">
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="rounded border bg-background p-2 font-mono text-sm">
                {selectedClasses.join(' ')}
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground">
              No classes selected yet. Choose classes to preview and apply.
            </div>
          )}

          <Preview selectedClasses={selectedClasses} />

          {hasNoCategories && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              No CSS categories available yet. Add some in the CSS Classes tab.
            </div>
          )}

          {hasNoSearchResults && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              No classes match &quot;{searchQuery}&quot;.
            </div>
          )}

          <RuleEditor
            filteredCategories={filteredCategories}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedClassSet={selectedClassSet}
            toggleClass={toggleClass}
            customClass={customClass}
            setCustomClass={setCustomClass}
            canAddCustom={canAddCustom}
            addCustomClass={addCustomClass}
            invalidCustomTokens={invalidCustomTokens}
            duplicateCustomTokens={duplicateCustomTokens}
            unknownCustomTokens={unknownCustomTokens}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk className="mr-2" />
            Apply Classes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
