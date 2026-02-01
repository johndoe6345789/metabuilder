import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import copy from '@/data/github-build-status.json'

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  html_url: string
  head_branch: string
  head_sha: string
  event: string
  workflow_id: number
  path: string
}

export interface Workflow {
  id: number
  name: string
  path: string
  state: string
  badge_url: string
}

interface UseGithubBuildStatusArgs {
  owner: string
  repo: string
  defaultBranch?: string
}

export const useGithubBuildStatus = ({
  owner,
  repo,
  defaultBranch = 'main',
}: UseGithubBuildStatusArgs) => {
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([])
  const [allWorkflows, setAllWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null)

  const formatWithCount = useCallback((template: string, count: number) => {
    return template.replace('{count}', count.toString())
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [runsResponse, workflowsResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        }),
      ])

      if (!runsResponse.ok || !workflowsResponse.ok) {
        throw new Error(`GitHub API error: ${runsResponse.status}`)
      }

      const runsData = await runsResponse.json()
      const workflowsData = await workflowsResponse.json()

      setWorkflows(runsData.workflow_runs || [])
      setAllWorkflows(workflowsData.workflows || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }, [owner, repo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getBadgeUrl = useCallback(
    (workflowPath: string, branch = defaultBranch) => {
      const workflowFile = workflowPath.split('/').pop()
      if (branch) {
        return `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}/badge.svg?branch=${branch}`
      }
      return `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}/badge.svg`
    },
    [defaultBranch, owner, repo],
  )

  const getBadgeMarkdown = useCallback(
    (workflowPath: string, workflowName: string, branch?: string) => {
      const badgeUrl = getBadgeUrl(workflowPath, branch)
      const actionUrl = `https://github.com/${owner}/${repo}/actions/workflows/${workflowPath.split('/').pop()}`
      return `[![${workflowName}](${badgeUrl})](${actionUrl})`
    },
    [getBadgeUrl, owner, repo],
  )

  const copyBadgeMarkdown = useCallback(
    (workflowPath: string, workflowName: string, branch?: string) => {
      const markdown = getBadgeMarkdown(workflowPath, workflowName, branch)
      navigator.clipboard.writeText(markdown)
      const key = `${workflowPath}-${branch || defaultBranch}`
      setCopiedBadge(key)
      toast.success(copy.toast.badgeCopied)
      setTimeout(() => setCopiedBadge(null), 2000)
    },
    [defaultBranch, getBadgeMarkdown],
  )

  const formatTime = useCallback(
    (dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return formatWithCount(copy.time.daysAgo, days)
      if (hours > 0) return formatWithCount(copy.time.hoursAgo, hours)
      if (minutes > 0) return formatWithCount(copy.time.minutesAgo, minutes)
      return copy.time.justNow
    },
    [formatWithCount],
  )

  const actions = useMemo(
    () => ({
      refresh: fetchData,
      copyBadgeMarkdown,
      getBadgeUrl,
      getBadgeMarkdown,
      formatTime,
    }),
    [copyBadgeMarkdown, fetchData, formatTime, getBadgeMarkdown, getBadgeUrl],
  )

  return {
    loading,
    error,
    workflows,
    allWorkflows,
    copiedBadge,
    actions,
  }
}
