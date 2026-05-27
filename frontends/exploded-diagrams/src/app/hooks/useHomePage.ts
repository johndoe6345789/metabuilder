import { useState, useEffect } from 'react'
import { BASE_PATH } from '@/lib/app-config'

interface Category {
  id: string
  name: string
  description: string
}

interface UseHomePageResult {
  categories: Category[]
  loading: boolean
}

export function useHomePage(): UseHomePageResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_PATH}/packages/index.json`)
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load categories:', err)
        setLoading(false)
      })
  }, [])

  return { categories, loading }
}
