import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export function useEditRedirect() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/snippet/${id}`)
  }, [id, router])
}
