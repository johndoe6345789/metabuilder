import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HowItWorksCardProps {
  title: string
  steps: string[]
}

export function HowItWorksCard({ title, steps }: HowItWorksCardProps) {
  return (
    <Card className="bg-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              {index + 1}
            </div>
            <p className="text-muted-foreground">
              {step}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
