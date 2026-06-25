'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { useManufacturerPage } from './hooks/useManufacturerPage'

export default function ManufacturerPage() {
  const params = useParams()
  const category = params.category as string
  const manufacturer = params.manufacturer as string
  const { products, loading } = useManufacturerPage(
    category,
    manufacturer
  )

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
              <Link
                href={`/${category}/${manufacturer}/${prod.id}`}
                key={prod.id}
                className="package-card"
              >
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
