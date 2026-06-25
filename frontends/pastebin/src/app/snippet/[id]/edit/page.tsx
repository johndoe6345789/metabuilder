'use client'

import { useEditRedirect } from './hooks/useEditRedirect'

// Edit mode is now inline on the view page — redirect there
export default function EditSnippetPage() {
  useEditRedirect()
  return null
}
