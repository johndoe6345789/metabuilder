export interface StyleClassShape {
  id: string
  name: string
  props: Record<string, string>
}

export interface RuleRow {
  id: string
  ruleKey: string
  name: string
  sortOrder: number
}

export interface PropRow {
  ruleId: string
  name: string
  value: string | null
}
