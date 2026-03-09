'use client'

import dynamic from 'next/dynamic'

const EmailClientContent = dynamic(() => import('./EmailClientContent'), { ssr: false })

export default function Page() {
  return <EmailClientContent />
}
