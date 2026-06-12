import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@metabuilder/components/fakemui'
import { useAppDispatch } from '@/store/hooks'
import { addSnippetLocal } from '@/store/slices/snippetsSlice'
import { forkSnippet, forkSharedSnippet } from '@/store/slices/revisionsSlice'

interface UseForkDialogProps {
  snippetId: string
  snippetTitle: string
  isShared?: boolean
  token?: string
  onClose: () => void
}

export function useForkDialog({
  snippetId,
  snippetTitle,
  isShared,
  token,
  onClose,
}: UseForkDialogProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [title, setTitle] = useState(`${snippetTitle} (fork)`)
  const [forking, setForking] = useState(false)

  async function handleFork() {
    setForking(true)
    try {
      const newSnippet =
        isShared && token
          ? await dispatch(forkSharedSnippet({ token, title })).unwrap()
          : await dispatch(forkSnippet({ snippetId, title })).unwrap()
      dispatch(addSnippetLocal(newSnippet))
      onClose()
      router.push(`/snippet/${newSnippet.id}`)
    } catch {
      toast.error('Failed to fork snippet — please try again')
    }
    setForking(false)
  }

  return { title, setTitle, forking, handleFork }
}
