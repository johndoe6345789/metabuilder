'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_PATH } from '@/lib/app-config'

interface Category {
  id: string
  name: string
  description: string
}

export default function Home() {
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
              <Link href={`/${cat.id}`} key={cat.id} className="package-card">
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
