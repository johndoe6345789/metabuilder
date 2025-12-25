import { LUA_SNIPPETS } from '../snippets/lua-snippets-data'

/**
 * Get all unique tags across snippets
 * @returns Sorted list of tags
 */
export const getAllSnippetTags = (): string[] => {
  const tagSet = new Set<string>()

  for (const snippet of LUA_SNIPPETS) {
    for (const tag of snippet.tags) {
      tagSet.add(tag)
    }
  }

  return Array.from(tagSet).sort()
}
