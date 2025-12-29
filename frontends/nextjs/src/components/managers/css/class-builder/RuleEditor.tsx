import { Plus } from '@phosphor-icons/react'

import {
  Button,
  Input,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import type { CssCategory } from '@/lib/database'

interface RuleEditorProps {
  filteredCategories: CssCategory[]
  activeTab: string
  onTabChange: (value: string) => void
  selectedClassSet: Set<string>
  toggleClass: (cssClass: string) => void
  customClass: string
  setCustomClass: (value: string) => void
  canAddCustom: boolean
  addCustomClass: () => void
  invalidCustomTokens: string[]
  duplicateCustomTokens: string[]
  unknownCustomTokens: string[]
}

export function RuleEditor({
  filteredCategories,
  activeTab,
  onTabChange,
  selectedClassSet,
  toggleClass,
  customClass,
  setCustomClass,
  canAddCustom,
  addCustomClass,
  invalidCustomTokens,
  duplicateCustomTokens,
  unknownCustomTokens,
}: RuleEditorProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1">
      <div className="overflow-x-auto">
        <TabsList className="w-max">
          {filteredCategories.map(category => (
            <TabsTrigger key={category.name} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </div>

      {filteredCategories.map(category => (
        <TabsContent key={category.name} value={category.name}>
          <ScrollArea className="h-[300px] border rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {category.classes.map(cls => (
                <button
                  key={cls}
                  onClick={() => toggleClass(cls)}
                  aria-pressed={selectedClassSet.has(cls)}
                  className={`
                    px-3 py-2 text-sm rounded border text-left font-mono transition-all duration-150 active:scale-95
                    ${
                      selectedClassSet.has(cls)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  {cls}
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}

      <TabsContent value="custom">
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom class name..."
              value={customClass}
              onChange={e => setCustomClass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAddCustom && addCustomClass()}
              className={`font-mono ${invalidCustomTokens.length > 0 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            <Button onClick={addCustomClass} disabled={!canAddCustom}>
              <Plus className="mr-2" />
              Add
            </Button>
          </div>
          {invalidCustomTokens.length > 0 && (
            <p className="text-xs text-destructive">
              Invalid class names: {invalidCustomTokens.join(', ')}
            </p>
          )}
          {invalidCustomTokens.length === 0 && unknownCustomTokens.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Not in library: {unknownCustomTokens.join(', ')}. They will still be added.
            </p>
          )}
          {duplicateCustomTokens.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Already selected: {duplicateCustomTokens.join(', ')}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Add custom CSS classes that aren't in the predefined list.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
