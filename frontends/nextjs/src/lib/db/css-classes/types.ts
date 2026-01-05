export interface CssCategory {
  id?: string
  name: string
  description?: string | null
}

export interface CssClass {
  id?: string
  categoryId: string
  name: string
  className: string
}
