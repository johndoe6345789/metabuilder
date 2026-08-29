/**
 * The first element of an array that is non-empty by construction.
 *
 * Static config arrays -- panel tabs, editor tabs -- always have entries, but
 * a type cannot know that, so indexing them under noUncheckedIndexedAccess is
 * `T | undefined` and every caller ends up writing a fallback for a case that
 * cannot happen. This states the invariant once and fails loudly if it is
 * ever broken, which is better than a silent undefined reaching the render.
 */
export function firstOf<T>(items: readonly T[], what: string): T {
  const first = items[0]
  if (first === undefined) {
    throw new Error(`${what} must not be empty`)
  }
  return first
}

/** The matching item, or the first one, for a list that always has entries. */
export function findOrFirst<T>(
  items: readonly T[],
  match: (item: T) => boolean,
  what: string
): T {
  return items.find(match) ?? firstOf(items, what)
}
