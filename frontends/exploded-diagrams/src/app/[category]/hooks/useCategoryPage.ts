import { useState, useEffect } from 'react'
import { BASE_PATH } from '@/lib/app-config'

interface Manufacturer {
  id: string
  name: string
  description: string
}

interface UseCategoryPageResult {
  manufacturers: Manufacturer[]
  loading: boolean
}

export function useCategoryPage(
  category: string
): UseCategoryPageResult {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_PATH}/packages/${category}/index.json`)
      .then(res => res.json())
      .then(data => {
        setManufacturers(data.manufacturers)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load manufacturers:', err)
        setLoading(false)
      })
  }, [category])

  return { manufacturers, loading }
}
