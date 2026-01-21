import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { moleculesCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface SearchBarsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function SearchBarsSection({ onSaveSnippet }: SearchBarsSectionProps) {
  return (
    <section className="space-y-6" data-testid="search-bars-section" role="region" aria-label="Search bar components">
      <div>
        <h2 className="text-3xl font-bold mb-2">Search Bars</h2>
        <p className="text-muted-foreground">
          Combined search input with actions
        </p>
      </div>

      <ComponentShowcase
        code={moleculesCodeSnippets.searchBarWithButton}
        title="Search Bar with Button"
        description="Search input combined with action button"
        category="molecules"
        onSaveSnippet={onSaveSnippet}
      >
        <Card className="p-6">
          <div className="space-y-6">
            <div className="relative max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Search..." className="pl-10" />
            </div>

            <Separator />

            <div className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
              <Button>Search</Button>
            </div>

            <Separator />

            <div className="relative max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Search products, articles, documentation..." className="pl-10 h-12" />
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
