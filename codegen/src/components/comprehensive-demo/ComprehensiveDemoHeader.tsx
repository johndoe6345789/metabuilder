import strings from '@/data/comprehensive-demo.json'

export function ComprehensiveDemoHeader() {
  return (
    <div className="space-y-2">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
        {strings.header.title}
      </h1>
      <p className="text-muted-foreground">{strings.header.subtitle}</p>
    </div>
  )
}
