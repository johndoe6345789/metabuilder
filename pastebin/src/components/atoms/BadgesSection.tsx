import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Check, X, Star } from '@phosphor-icons/react'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { atomsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface BadgesSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function BadgesSection({ onSaveSnippet }: BadgesSectionProps) {
  return (
    <section className="space-y-6" data-testid="badges-section" role="region" aria-label="Badge status indicators">
      <div>
        <h2 className="text-3xl font-bold mb-2">Badges</h2>
        <p className="text-muted-foreground">
          Small status indicators and labels
        </p>
      </div>
      
      <ComponentShowcase
        code={atomsCodeSnippets.badgeWithIcons}
        title="Badge with Icons"
        description="Badge components with icon combinations"
        category="atoms"
        onSaveSnippet={onSaveSnippet}
      >
        <Card className="p-6">
          <div className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Variants
              </h3>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                With Icons
              </h3>
              <div className="flex flex-wrap gap-4">
                <Badge>
                  <Check weight="bold" className="mr-1" />
                  Completed
                </Badge>
                <Badge variant="destructive">
                  <X weight="bold" className="mr-1" />
                  Failed
                </Badge>
                <Badge variant="secondary">
                  <Star weight="fill" className="mr-1" />
                  Featured
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
