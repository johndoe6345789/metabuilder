'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Edit mode is now inline on the view page — redirect there
export default function EditSnippetPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/snippet/${id}`)
  }, [id, router])

  return null
}
