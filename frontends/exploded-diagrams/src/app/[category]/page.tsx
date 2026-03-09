'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_PATH } from '@/lib/app-config'

interface Manufacturer {
  id: string
  name: string
  description: string
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
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
              <Link href={`/${category}/${mfr.id}`} key={mfr.id} className="package-card">
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
