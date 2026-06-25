'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { useCategoryPage } from './hooks/useCategoryPage'

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const { manufacturers, loading } = useCategoryPage(category)

  return (
    <>
      <Breadcrumb path={[category]} />
      <section className="browser-section">
        <h2>Manufacturers</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="package-grid">
            {manufacturers.map(mfr => (
              <Link
                href={`/${category}/${mfr.id}`}
                key={mfr.id}
                className="package-card"
              >
                <h4>{mfr.name}</h4>
                <p>{mfr.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
