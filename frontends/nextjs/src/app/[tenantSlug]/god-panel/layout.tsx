'use client'

import { AuthProvider } from '@/app/_components/auth-provider'
import { AppShell } from '@/components/layout'

export default function TenantGodPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
