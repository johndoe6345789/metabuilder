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
  /**
   * Build a page of its own from here, rather than adding to the tree the
   * editor already has loaded.
   */
  | { kind: 'clear'; line: number }
  /**
   * The workflow half of the language. A script builds either a page or a
   * workflow, and these four say so: what it is called, what sets it
   * going, what it does step by step, and that it is ready.
   */
  | { kind: 'workflow'; line: number; name: string }
  | { kind: 'trigger'; line: number; event: string }
  | { kind: 'step'; line: number; stepName: string; attrs: BqlAttr[] }
  | { kind: 'publishWorkflow'; line: number }
