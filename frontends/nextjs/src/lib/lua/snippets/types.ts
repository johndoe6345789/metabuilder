export interface LuaSnippet {
  id: string
  name: string
  description: string
  category: string
  code: string
  tags: string[]
  parameters?: Array<{ name: string; type: string; description: string }>
}
