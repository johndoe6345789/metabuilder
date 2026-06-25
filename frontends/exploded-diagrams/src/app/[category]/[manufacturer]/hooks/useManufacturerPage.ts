import { useState, useEffect } from 'react'
import { BASE_PATH } from '@/lib/app-config'

interface Product {
  id: string
  name: string
  description: string
}

interface UseManufacturerPageResult {
  products: Product[]
  loading: boolean
}

export function useManufacturerPage(
  category: string,
  manufacturer: string
): UseManufacturerPageResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url =
      `${BASE_PATH}/packages/${category}/${manufacturer}/index.json`
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load products:', err)
        setLoading(false)
      })
  }, [category, manufacturer])

  return { products, loading }
}
