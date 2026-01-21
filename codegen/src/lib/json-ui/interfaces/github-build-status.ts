export interface GitHubBuildStatusWorkflowItem {
  id: string
  name: string
  status?: string
  conclusion?: string | null
  branch?: string
  updatedAt?: string
  event?: string
  url?: string
}

export interface GitHubBuildStatusProps {
  title?: string
  description?: string
  workflows?: GitHubBuildStatusWorkflowItem[]
  isLoading?: boolean
  errorMessage?: string
  emptyMessage?: string
  footerLinkLabel?: string
  footerLinkUrl?: string
  className?: string
}
