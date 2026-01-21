export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
}

export interface SearchResultsProps {
  groupedResults: Record<string, SearchResult[]>
  onSelect: (result: SearchResult) => void
}
