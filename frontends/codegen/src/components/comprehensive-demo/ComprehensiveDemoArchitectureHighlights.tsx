import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@metabuilder/fakemui/surfaces'
import { Check } from '@metabuilder/fakemui/icons'
import strings from '@/data/comprehensive-demo.json'

export function ComprehensiveDemoArchitectureHighlights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.architecture.title}</CardTitle>
        <CardDescription>{strings.architecture.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {strings.architecture.items.map((item) => (
          <div key={item.title}>
            <Check size={16} weight="bold" />
            <div>
              <p>{item.title}</p>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
