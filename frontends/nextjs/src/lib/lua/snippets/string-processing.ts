import { LuaSnippet } from './types'

export const STRING_PROCESSING_SNIPPETS: LuaSnippet[] = [
  {
    id: 'string_slugify',
    name: 'Create URL Slug',
    description: 'Convert text to URL-friendly slug',
    category: 'String Processing',
    tags: ['string', 'slug', 'url'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text to slugify' }
    ],
    code: `local text = context.data.text or ""

local slug = string.lower(text)
slug = string.gsub(slug, "%s+", "-")
slug = string.gsub(slug, "[^%w%-]", "")
slug = string.gsub(slug, "%-+", "-")
slug = string.gsub(slug, "^%-+", "")
slug = string.gsub(slug, "%-+$", "")

return {
  original = text,
  slug = slug
}`
  },
  {
    id: 'string_truncate',
    name: 'Truncate Text',
    description: 'Truncate long text with ellipsis',
    category: 'String Processing',
    tags: ['string', 'truncate', 'ellipsis'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text to truncate' },
      { name: 'maxLength', type: 'number', description: 'Maximum length' }
    ],
    code: `local text = context.data.text or ""
local maxLength = context.data.maxLength or 50

if string.len(text) <= maxLength then
  return {
    truncated = false,
    text = text
  }
end

local truncated = string.sub(text, 1, maxLength - 3) .. "..."

return {
  truncated = true,
  text = truncated,
  originalLength = string.len(text)
}`
  },
  {
    id: 'string_extract_hashtags',
    name: 'Extract Hashtags',
    description: 'Find all hashtags in text',
    category: 'String Processing',
    tags: ['string', 'parse', 'hashtags'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text containing hashtags' }
    ],
    code: `local text = context.data.text or ""
local hashtags = {}

for tag in string.gmatch(text, "#(%w+)") do
  table.insert(hashtags, tag)
end

return {
  text = text,
  hashtags = hashtags,
  count = #hashtags
}`
  },
  {
    id: 'string_word_count',
    name: 'Word Counter',
    description: 'Count words and characters in text',
    category: 'String Processing',
    tags: ['string', 'count', 'statistics'],
    parameters: [
      { name: 'text', type: 'string', description: 'Text to analyze' }
    ],
    code: `local text = context.data.text or ""

local charCount = string.len(text)
local words = {}

for word in string.gmatch(text, "%S+") do
  table.insert(words, word)
end

local wordCount = #words

local sentences = 0
for _ in string.gmatch(text, "[.!?]+") do
  sentences = sentences + 1
end

return {
  characters = charCount,
  words = wordCount,
  sentences = sentences,
  avgWordLength = wordCount > 0 and charCount / wordCount or 0
}`
  }
]
