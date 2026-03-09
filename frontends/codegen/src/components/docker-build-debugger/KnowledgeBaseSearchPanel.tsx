import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { MagnifyingGlass } from '@metabuilder/fakemui/icons'

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
    <Card>
      <CardHeader>
        <CardTitle>
          <MagnifyingGlass size={20} weight="bold" />
          {text.title}
        </CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <MagnifyingGlass size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={text.searchPlaceholder}
          />
        </div>
      </CardContent>
    </Card>
  )
}
