import { QueryConsole } from '@/QueryConsole'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DBAL Query Console',
  description: 'Execute REST queries against the DBAL daemon.',
}

export default function QueryPage() {
  return <QueryConsole />
}
