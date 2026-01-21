import { Code, Plus, CaretDown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
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
import templatesData from '@/data/templates.json'

const templates = templatesData as SnippetTemplate[]

interface EmptyStateProps {
  onCreateClick: () => void
  onCreateFromTemplate?: (templateId: string) => void
}

export function EmptyState({ onCreateClick, onCreateFromTemplate }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
      data-testid="empty-state"
      role="status"
      aria-live="polite"
      aria-label="No snippets available"
    >
      {/* Aria-live region for empty state announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="empty-state-message"
      >
        {strings.emptyState.title}. {strings.emptyState.description}
      </div>

      <div className="rounded-full bg-accent/10 p-6 mb-6" aria-hidden="true">
        <Code className="h-16 w-16 text-accent" weight="duotone" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">{strings.emptyState.title}</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        {strings.emptyState.description}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="gap-2"
            data-testid="empty-state-create-menu"
            aria-label="Create new snippet from templates"
          >
            <Code className="h-5 w-5" weight="bold" aria-hidden="true" />
            {strings.emptyState.buttonText}
            <CaretDown weight="bold" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="w-72 max-h-[500px] overflow-y-auto"
          data-testid="empty-state-menu-content"
        >
          <DropdownMenuItem
            onClick={onCreateClick}
            data-testid="create-blank-snippet-item"
          >
            <Plus className="mr-2 h-4 w-4" weight="bold" aria-hidden="true" />
            Blank Snippet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>React Components</DropdownMenuLabel>
          {templates.filter((t) => t.category === 'react').map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onCreateFromTemplate?.(template.id)}
              data-testid={`template-react-${template.id}`}
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
          <DropdownMenuLabel>JavaScript / TypeScript</DropdownMenuLabel>
          {templates.filter((t) => ['api', 'basics', 'async', 'types'].includes(t.category)).map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onCreateFromTemplate?.(template.id)}
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
          <DropdownMenuLabel>CSS Layouts</DropdownMenuLabel>
          {templates.filter((t) => t.category === 'layout').map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onCreateFromTemplate?.(template.id)}
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
          <DropdownMenuLabel>Python - Project Euler</DropdownMenuLabel>
          {templates.filter((t) => t.category === 'euler').map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onCreateFromTemplate?.(template.id)}
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
          <DropdownMenuLabel>Python - Algorithms</DropdownMenuLabel>
          {templates.filter((t) => t.category === 'algorithms' && t.language === 'Python').map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onCreateFromTemplate?.(template.id)}
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
          <DropdownMenuLabel>Python - Interactive Programs</DropdownMenuLabel>
          {templates.filter((t) => t.category === 'interactive').map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onCreateFromTemplate?.(template.id)}
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
  )
}
