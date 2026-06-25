import { useState, useEffect } from 'react'
import { BASE_PATH } from '@/lib/app-config'

interface ProductPackage {
  name: string
  assemblies: string[]
}

interface UseProductPageResult {
  pkg: ProductPackage | null
  loading: boolean
}

export function useProductPage(
  category: string,
  manufacturer: string,
  product: string
): UseProductPageResult {
  const [pkg, setPkg] = useState<ProductPackage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url =
      `${BASE_PATH}/packages/` +
      `${category}/${manufacturer}/${product}/package.json`
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPkg(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load product:', err)
        setLoading(false)
      })
  }, [category, manufacturer, product])

  return { pkg, loading }
}
