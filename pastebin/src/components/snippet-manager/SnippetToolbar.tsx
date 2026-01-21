import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, MagnifyingGlass, CaretDown, CheckSquare, X } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { strings } from '@/lib/config'
import { SnippetTemplate } from '@/lib/types'

interface SnippetToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectionMode: boolean
  onToggleSelectionMode: () => void
  onCreateNew: () => void
  onCreateFromTemplate: (templateId: string) => void
  templates: SnippetTemplate[]
}

export function SnippetToolbar({
  searchQuery,
  onSearchChange,
  selectionMode,
  onToggleSelectionMode,
  onCreateNew,
  onCreateFromTemplate,
  templates,
}: SnippetToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" data-testid="snippet-toolbar" role="toolbar" aria-label="Snippet management toolbar">
      <div className="relative flex-1 w-full sm:max-w-md" data-testid="search-container">
        <MagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder={strings.app.search.placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          data-testid="snippet-search-input"
          aria-label="Search snippets"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto" data-testid="toolbar-actions">
        <Button
          variant={selectionMode ? "filled" : "outline"}
          onClick={onToggleSelectionMode}
          className="gap-2"
          data-testid="snippet-selection-mode-btn"
          aria-pressed={selectionMode}
          aria-label={selectionMode ? "Cancel selection mode" : "Enter selection mode"}
        >
          {selectionMode ? (
            <>
              <X weight="bold" aria-hidden="true" />
              Cancel
            </>
          ) : (
            <>
              <CheckSquare weight="bold" aria-hidden="true" />
              Select
            </>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="gap-2 w-full sm:w-auto"
              data-testid="snippet-create-menu-trigger"
              aria-label="Create new snippet"
              aria-haspopup="menu"
            >
              <Plus weight="bold" aria-hidden="true" />
              {strings.app.header.newSnippetButton}
              <CaretDown weight="bold" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 max-h-[500px] overflow-y-auto" data-testid="create-menu-content">
            <DropdownMenuItem
              onClick={onCreateNew}
              data-testid="snippet-create-blank-item"
            >
              <Plus className="mr-2 h-4 w-4" weight="bold" aria-hidden="true" />
              Blank Snippet
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>React Components</DropdownMenuLabel>
            {templates.filter((t) => t.category === 'react').map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => onCreateFromTemplate(template.id)}
                data-testid={`snippet-template-react-${template.id}`}
              >
                <div className="flex flex-col gap-1 py-1">
                  <span className="font-medium">{template.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {template.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Python Scripts</DropdownMenuLabel>
            {templates.filter((t) => t.category === 'python').map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => onCreateFromTemplate(template.id)}
                data-testid={`snippet-template-python-${template.id}`}
              >
                <div className="flex flex-col gap-1 py-1">
                  <span className="font-medium">{template.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {template.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>JavaScript Utils</DropdownMenuLabel>
            {templates.filter((t) => t.category === 'javascript').map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => onCreateFromTemplate(template.id)}
                data-testid={`snippet-template-javascript-${template.id}`}
              >
                <div className="flex flex-col gap-1 py-1">
                  <span className="font-medium">{template.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {template.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
