export interface CssCategory {
  id?: string
  name: string
  description?: string | null
  classes?: CssClass[] | string[] | string
}

export interface CssClass {
  id?: string
  categoryId: string
  name: string
  className: string
}
