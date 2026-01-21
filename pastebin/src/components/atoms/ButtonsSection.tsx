import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Heart,
  Star,
  Lightning,
  Plus,
} from '@phosphor-icons/react'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { atomsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface ButtonsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ButtonsSection({ onSaveSnippet }: ButtonsSectionProps) {
  return (
    <section className="space-y-6" data-testid="buttons-section" role="region" aria-label="Button components">
      <div>
        <h2 className="text-3xl font-bold mb-2">Buttons</h2>
        <p className="text-muted-foreground">
          Interactive controls with multiple variants and states
        </p>
      </div>
      
      <ComponentShowcase
        code={atomsCodeSnippets.buttonWithIcons}
        title="Button with Icons"
        description="Buttons with icon and text combinations"
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
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Sizes
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Heart weight="fill" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                With Icons
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Star weight="fill" aria-hidden="true" />
                  Favorite
                </Button>
                <Button variant="outline">
                  <Plus weight="bold" aria-hidden="true" />
                  Add Item
                </Button>
                <Button variant="secondary">
                  <Lightning weight="fill" aria-hidden="true" />
                  Quick Action
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                States
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
