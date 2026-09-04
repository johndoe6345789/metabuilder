/**
 * The BQL sentence shapes -- syntax only, no knowledge of what block names
 * or properties are valid. Parsing itself now happens in DBAL (see
 * dbal-parse.ts and the dbal repo's bql_parser.hpp) so it's written once
 * and shared across apps; these types describe the JSON it returns.
 */
export interface BqlAttr {
  key: string
  value: string
}

export type BqlSentence =
  | {
      kind: 'add'
      line: number
      blockName: string
      text?: string
      attrs: BqlAttr[]
      alias?: string
      parentAlias?: string
    }
  | { kind: 'give'; line: number; alias: string; attrs: BqlAttr[] }
  | { kind: 'style'; line: number; name: string; attrs: BqlAttr[] }
  | { kind: 'class'; line: number; names: string[]; alias: string }
  /** Where the tree this script built should be published. */
  | { kind: 'publish'; line: number; title?: string; path: string }
