import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSharedSnippet } from '@/store/slices/shareSlice'
import { selectSharedSnippet, selectShareLoading } from '@/store/selectors'

export function useSharePage() {
  const { token } = useParams<{ token: string }>()
  const dispatch = useAppDispatch()
  const snippet = useAppSelector(state => selectSharedSnippet(state, token))
  const loading = useAppSelector(selectShareLoading)
  const [copied, setCopied] = useState(false)
  const [forkOpen, setForkOpen] = useState(false)

  useEffect(() => {
    if (token) dispatch(fetchSharedSnippet(token))
  }, [token, dispatch])

  function handleCopy() {
    if (!snippet) return
    const code = snippet.files?.length
      ? snippet.files.map(f => `// ${f.name}\n${f.content}`).join('\n\n')
      : snippet.code
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return {
    token,
    snippet,
    loading,
    copied,
    forkOpen,
    setForkOpen,
    handleCopy,
  }
}
