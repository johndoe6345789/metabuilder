'use client'

import { useEffect } from 'react'

interface PackageStyleLoaderProps {
  packages: string[]
}

export function PackageStyleLoader({ packages }: PackageStyleLoaderProps): null {
  useEffect(() => {
    const loadPackageStyle = async (id: string) => {
      if (document.querySelector(`style[data-pkg="${id}"]`)) return
      try {
        const res = await fetch(`/app/api/packages/styles?id=${id}`)
        if (!res.ok) return
        const css = await res.text()
        if (!css.trim() || css.includes('not found')) return
        const el = document.createElement('style')
        el.setAttribute('data-pkg', id)
        el.textContent = css
        document.head.appendChild(el)
      } catch { /* silent */ }
    }

    packages.forEach((id) => {
      void loadPackageStyle(id)
    })
  }, [packages])

  return null
}
