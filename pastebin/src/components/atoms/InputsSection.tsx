import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { atomsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface InputsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function InputsSection({ onSaveSnippet }: InputsSectionProps) {
  return (
    <section className="space-y-6" data-testid="inputs-section" role="region" aria-label="Input form fields">
      <div>
        <h2 className="text-3xl font-bold mb-2">Inputs</h2>
        <p className="text-muted-foreground">
          Form input fields for user data entry
        </p>
      </div>
      
      <ComponentShowcase
        code={atomsCodeSnippets.inputWithIcon}
        title="Input with Icon"
        description="Input field with icon decoration"
        category="atoms"
        onSaveSnippet={onSaveSnippet}
      >
        <Card className="p-6">
          <div className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                States
              </h3>
              <div className="space-y-4 max-w-md">
                <Input placeholder="Default input" />
                <Input placeholder="Disabled input" disabled />
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <Input placeholder="Search..." className="pl-10" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Types
              </h3>
              <div className="space-y-4 max-w-md">
                <Input type="text" placeholder="Text input" />
                <Input type="email" placeholder="email@example.com" />
                <Input type="password" placeholder="Password" />
                <Input type="number" placeholder="123" />
              </div>
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
