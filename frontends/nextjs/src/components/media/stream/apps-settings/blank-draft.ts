import type { StreamApp } from '../useStreamApps'

export const BLANK_DRAFT: Omit<StreamApp, 'id'> = {
  name: '',
  url: '',
  bgColor: '#222222',
  fgColor: '#ffffff',
  embedMode: 'newtab',
  sortOrder: 0,
}
