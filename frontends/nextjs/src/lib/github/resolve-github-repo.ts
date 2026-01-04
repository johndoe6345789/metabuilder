// TODO: Implement GitHub repo resolution
export const resolveGitHubRepo = (urlOrParams?: string | URLSearchParams, ref?: string) => {
  if (typeof urlOrParams === 'string') {
    return { 
      owner: urlOrParams?.split('/')[0] || '', 
      repo: urlOrParams?.split('/')[1] || '' 
    }
  }
  // URLSearchParams case
  const params = urlOrParams as URLSearchParams
  return {
    owner: params?.get('owner') || '',
    repo: params?.get('repo') || ''
  }
}
