'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_PATH } from '@/lib/app-config'

interface Product {
  id: string
  name: string
  description: string
}

export default function ManufacturerPage() {
  const params = useParams()
  const category = params.category as string
  const manufacturer = params.manufacturer as string
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_PATH}/packages/${category}/${manufacturer}/index.json`)
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

  return (
    <>
      <Breadcrumb path={[category, manufacturer]} />
      <section className="browser-section">
        <h2>Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="package-grid">
            {products.map(prod => (
              <Link href={`/${category}/${manufacturer}/${prod.id}`} key={prod.id} className="package-card">
                <h4>{prod.name}</h4>
                <p>{prod.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
