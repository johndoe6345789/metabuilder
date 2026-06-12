import { useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { patchSnippetLocal } from '@/store/slices/snippetsSlice'
import { generateShareToken, revokeShareToken } from '@/store/slices/shareSlice'
import type { Snippet } from '@/lib/types'

export function buildShareUrl(token: string): string {
  if (typeof window === 'undefined') return `/share/${token}`
  return `${window.location.origin}/share/${token}`
}

export function useShareDialog(snippet: Snippet) {
  const dispatch = useAppDispatch()
  const [generating, setGenerating] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = snippet.shareToken ? buildShareUrl(snippet.shareToken) : null

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await dispatch(generateShareToken(snippet.id)).unwrap()
      dispatch(
        patchSnippetLocal({
          id: snippet.id,
          fields: { shareToken: result.token },
        }),
      )
    } catch {
      /* error handled by slice */
    }
    setGenerating(false)
  }

  async function handleRevoke() {
    setRevoking(true)
    try {
      await dispatch(revokeShareToken(snippet.id)).unwrap()
      dispatch(
        patchSnippetLocal({
          id: snippet.id,
          fields: { shareToken: undefined },
        }),
      )
    } catch {
      /* error handled by slice */
    }
    setRevoking(false)
  }

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleNativeShare() {
    if (!shareUrl) return
    navigator.share({ title: snippet.title, url: shareUrl })
  }

  return {
    shareUrl,
    generating,
    revoking,
    copied,
    handleGenerate,
    handleRevoke,
    handleCopy,
    handleNativeShare,
  }
}
