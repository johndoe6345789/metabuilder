/** IndexedDB keys are IDBValidKey (string | number | Date | ArrayBuffer |
 *  ...); a dump needs a plain string, so this picks the natural rendering
 *  for each kind rather than one blanket JSON.stringify. */
export function decodeIdbKey(key: IDBValidKey): string {
  if (typeof key === 'string' || typeof key === 'number') return String(key)
  if (key instanceof Date) return key.toISOString()
  return JSON.stringify(key)
}
