/**
 * The access level a founder set on a page, read the same way everywhere.
 *
 * Three call sites read this field and disagreed: two treated anything
 * that was not a JS number as 0 (public) and one cast it to `number` and
 * fell back to 1. The field genuinely does not always arrive as a number --
 * the SQLite adapter emits a JSON number only for columns typed number or
 * bigint, and PageConfig.level is declared "integer" -- so "Admin only"
 * arrived as the string "3", missed the typeof check, and gated at 0.
 *
 * A level that was set is honoured however it is spelled. Only a row that
 * never declared one is public; a value that is present but unreadable
 * fails closed, because the alternative is publishing a private page.
 */
export function parsePageLevel(raw: unknown): number {
  if (raw === undefined || raw === null || raw === '') return 0

  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return Number.MAX_SAFE_INTEGER
  // A level below public does not mean "more public than public".
  return Math.max(0, Math.trunc(n))
}
