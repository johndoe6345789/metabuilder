// Shared mock state + fixtures for RootPage's split test files. Kept as
// .ts (no JSX) so it falls outside the 80-line .tsx guardrail.
import { vi } from 'vitest'

export const nav = { replace: vi.fn() }

export const jsonResponse = (data: unknown) => ({
  ok: true,
  json: () => Promise.resolve({ data }),
})
