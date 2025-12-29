import { ListNumbers, Plus, PushPinSimple, SquaresFour } from '@phosphor-icons/react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Separator,
} from '@/components/ui'

export interface PageSection {
  id: string
  title: string
  description?: string
  componentCount?: number
  status?: 'draft' | 'review' | 'published'
  updatedAt?: string
}

interface SectionListProps {
  sections: PageSection[]
  selectedSectionId?: string
  onSelectSection?: (section: PageSection) => void
  onCreateSection?: () => void
}

const statusVariant: Record<
  NonNullable<PageSection['status']>,
  'default' | 'secondary' | 'outline'
> = {
  draft: 'secondary',
  review: 'outline',
  published: 'default',
}

export function SectionList({
  sections,
  selectedSectionId,
  onSelectSection,
  onCreateSection,
}: SectionListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <ListNumbers size={20} weight="duotone" />
            Sections
          </CardTitle>
          <CardDescription>Outline the sections that make up your generic page.</CardDescription>
        </div>
        <Button size="sm" onClick={onCreateSection} variant="secondary">
          <Plus size={16} />
          Add Section
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {sections.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <p className="text-sm">
              No sections yet. Create your first section to start building the page.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[520px]">
            <div className="divide-y divide-border">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`w-full text-left transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    selectedSectionId === section.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onSelectSection?.(section)}
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="mt-1">
                      {section.status ? (
                        <Badge variant={statusVariant[section.status]} className="capitalize">
                          {section.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold leading-none">{section.title}</p>
                          {section.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {section.description}
                            </p>
                          )}
                        </div>
                        {section.updatedAt && (
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            Updated {section.updatedAt}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <SquaresFour size={14} />
                          {section.componentCount ?? 0} components
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="inline-flex items-center gap-1">
                          <PushPinSimple size={14} />
                          ID: {section.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
