import { useState } from 'react'

export interface CommentFormState {
  content: string
  preview: boolean
  submitting: boolean
  setContent: (v: string) => void
  setPreview: (v: boolean) => void
  handleSubmit: () => Promise<void>
}

export function useCommentForm(
  onSubmit: (content: string) => Promise<void>
): CommentFormState {
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setContent('')
      setPreview(false)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    content,
    preview,
    submitting,
    setContent,
    setPreview,
    handleSubmit,
  }
}
