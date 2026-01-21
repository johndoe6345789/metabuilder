import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Envelope, Lock } from '@phosphor-icons/react'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { moleculesCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface FormFieldsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function FormFieldsSection({ onSaveSnippet }: FormFieldsSectionProps) {
  return (
    <section className="space-y-6" data-testid="form-fields-section" role="region" aria-label="Form field components">
      <div>
        <h2 className="text-3xl font-bold mb-2">Form Fields</h2>
        <p className="text-muted-foreground">
          Input fields with labels and helper text
        </p>
      </div>

      <ComponentShowcase
        code={moleculesCodeSnippets.formField}
        title="Form Field with Icon and Helper Text"
        description="Complete form field with label, icon, and validation message"
        category="molecules"
        onSaveSnippet={onSaveSnippet}
      >
        <Card className="p-6">
          <div className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john@example.com" className="pl-10" />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll never share your email with anyone else.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" />
              </div>
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
