'use client'

import { useEffect } from 'react'

interface PackageStyleLoaderProps {
  packages: string[]
}

export function PackageStyleLoader({
  packages,
}: PackageStyleLoaderProps): null {
  useEffect(() => {
    const loadPackageStyle = async (id: string) => {
      const existing = document.querySelector<HTMLStyleElement>(
        `style[data-pkg="${id}"]`
      )
      try {
        const res = await fetch(`/app/api/packages/styles?id=${id}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const css = await res.text()
        if (css.trim().length === 0 || css.includes('not found')) return
        const el = existing ?? document.createElement('style')
        if (existing === null) el.setAttribute('data-pkg', id)
        el.textContent = css
        if (existing === null) document.head.appendChild(el)
      } catch {
        /* silent */
      }
    }

    packages.forEach(id => {
      void loadPackageStyle(id)
    })
  }, [packages])

  return null
}
