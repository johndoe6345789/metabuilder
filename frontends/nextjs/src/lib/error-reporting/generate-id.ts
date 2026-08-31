/** A short, collision-resistant-enough id for an in-memory error report
 *  -- not a database key, just something to key a list entry by. */
export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
