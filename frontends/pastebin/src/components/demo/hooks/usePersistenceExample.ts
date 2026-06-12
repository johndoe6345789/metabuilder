import { useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { createSnippet } from '@/store/slices/snippetsSlice'
import { toast } from 'sonner'

export interface PersistenceExampleState {
  title: string
  code: string
  setTitle: (v: string) => void
  setCode: (v: string) => void
  handleCreate: () => void
}

export function usePersistenceExample(): PersistenceExampleState {
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')

  const handleCreate = () => {
    if (!title || !code) {
      toast.error('Please enter both title and code')
      return
    }
    dispatch(
      createSnippet({
        title,
        code,
        language: 'JavaScript',
        category: 'Example',
        description: 'Created via persistence example',
      }),
    )
    toast.success('Snippet created and auto-saved to database!')
    setTitle('')
    setCode('')
  }

  return { title, code, setTitle, setCode, handleCreate }
}
