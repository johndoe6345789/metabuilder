import type { Metadata } from 'next'

import CodegenStudioClient from './CodegenStudioClient'

export const metadata: Metadata = {
  title: 'Codegen Studio',
  description: 'Generate and download custom starter bundles for MetaBuilder packages.',
}

export default function CodegenStudioPage() {
  return <CodegenStudioClient />
}
