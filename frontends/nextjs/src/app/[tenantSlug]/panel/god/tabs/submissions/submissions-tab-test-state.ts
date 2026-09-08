import { vi } from 'vitest'

import { parseSubmission } from './submission-row'

/** The message both SubmissionsTab test files render. */
export const message = parseSubmission({
  id: 'fs_1',
  formName: 'contact',
  path: '/contact',
  data: { name: 'Rosa', message: 'Do you build wheels?' },
  createdAt: 1751500000,
})

/** What useSubmissions hands the tab, with anything overridden. */
export const state = (over: Record<string, unknown> = {}) => ({
  tenant: 'acme',
  rows: [message],
  visible: [message],
  forms: ['contact'],
  loading: false,
  error: null,
  markError: null,
  form: '',
  setForm: vi.fn(),
  showHandled: false,
  setShowHandled: vi.fn(),
  mark: vi.fn((): Promise<void> => Promise.resolve()),
  waiting: 1,
  refresh: vi.fn(),
  ...over,
})
