'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_PATH } from '@/lib/app-config'

interface ProductPackage {
  name: string
  assemblies: string[]
}

function formatAssemblyName(name: string): string {
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function ProductPage() {
  const params = useParams()
  const category = params.category as string
  const manufacturer = params.manufacturer as string
  const product = params.product as string
  const [pkg, setPkg] = useState<ProductPackage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_PATH}/packages/${category}/${manufacturer}/${product}/package.json`)
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

  return (
    <>
      <Breadcrumb path={[category, manufacturer, product]} />
      <section className="browser-section">
        <h2>Assemblies</h2>
        {loading ? (
          <p>Loading...</p>
        ) : pkg ? (
          <div className="package-grid">
            {pkg.assemblies.map(asm => (
              <Link
                href={`/${category}/${manufacturer}/${product}/${asm}`}
                key={asm}
                className="package-card"
              >
                <h4>{formatAssemblyName(asm)}</h4>
                <p>Assembly</p>
              </Link>
            ))}
          </div>
        ) : (
          <p>No assemblies found</p>
        )}
      </section>
    </>
  )
}
