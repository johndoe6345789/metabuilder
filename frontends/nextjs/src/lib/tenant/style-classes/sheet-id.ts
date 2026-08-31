export const sheetId = (tenant: string): string => `styles_${tenant}`

/** Keep generated ids to characters an id column will not argue with. */
export const safe = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, '_')
