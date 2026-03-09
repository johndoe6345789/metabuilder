export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  category: string
  icon: React.ReactNode
  action: () => void
  tags?: string[]
}

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: number
  resultId?: string
  resultTitle?: string
  resultCategory?: string
}
