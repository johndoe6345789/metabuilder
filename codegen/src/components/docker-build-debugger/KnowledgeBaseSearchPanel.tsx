import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MagnifyingGlass } from '@phosphor-icons/react'

type KnowledgeBaseSearchPanelProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  text: {
    title: string
    description: string
    searchPlaceholder: string
  }
}

export function KnowledgeBaseSearchPanel({
  searchQuery,
  onSearchChange,
  text,
}: KnowledgeBaseSearchPanelProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MagnifyingGlass size={20} weight="bold" className="text-primary" />
          {text.title}
        </CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={text.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50"
          />
        </div>
      </CardContent>
    </Card>
  )
}
