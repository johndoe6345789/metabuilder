import type { ReactNode } from 'react'

export default function TenantRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="tenant-root">{children}</div>
}
