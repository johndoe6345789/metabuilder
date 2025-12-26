import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import CodegenStudioClient from './CodegenStudioClient'

describe('CodegenStudioClient', () => {
  const originalFetch = global.fetch
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['zip-binary'])),
      headers: { get: () => 'attachment; filename="codegen-studio.zip"' },
    }) as unknown as typeof fetch

    URL.createObjectURL = vi.fn(() => 'blob://codegen')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.clearAllMocks()
  })

  it('renders form and triggers ZIP download', async () => {
    render(<CodegenStudioClient />)

    const button = screen.getByRole('button', { name: /generate zip/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
