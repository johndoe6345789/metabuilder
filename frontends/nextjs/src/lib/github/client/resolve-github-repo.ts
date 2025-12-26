export function resolveGitHubRepo(params: URLSearchParams) {
  const ownerParam = params.get('owner')
  const repoParam = params.get('repo')
  const owner = (ownerParam && ownerParam.trim()) || process.env.GITHUB_OWNER || 'johndoe6345789'
  const repo = (repoParam && repoParam.trim()) || process.env.GITHUB_REPO || 'metabuilder'
  const slugPattern = /^[A-Za-z0-9_.-]+$/

  if (!slugPattern.test(owner) || !slugPattern.test(repo)) {
    const error = new Error('Invalid GitHub repository owner or repo')
    ;(error as Error & { status?: number }).status = 400
    throw error
  }

  return { owner, repo }
}
