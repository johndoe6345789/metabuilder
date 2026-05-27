'use client'

import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { useHomePage } from './hooks/useHomePage'

export default function Home() {
  const { categories, loading } = useHomePage()

  return (
    <>
      <Breadcrumb path={[]} />
      <section className="browser-section">
        <h2>Categories</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="package-grid">
            {categories.map(cat => (
              <Link
                href={`/${cat.id}`}
                key={cat.id}
                className="package-card"
              >
                <h4>{cat.name}</h4>
                <p>{cat.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
