import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from '@phosphor-icons/react'
import strings from '@/data/comprehensive-demo.json'

export function ComprehensiveDemoArchitectureHighlights() {
  return (
    <Card className="bg-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle>{strings.architecture.title}</CardTitle>
        <CardDescription>{strings.architecture.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {strings.architecture.items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <Check className="text-accent mt-1" size={16} weight="bold" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
