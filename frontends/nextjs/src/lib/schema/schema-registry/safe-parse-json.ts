/** JSON.parse that reports failure as undefined instead of throwing --
 *  a schema's stored `fields` JSON is user/package-editable data. */
export function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}
