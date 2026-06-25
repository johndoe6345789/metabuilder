/**
 * Type declaration for @/data/favicon-designer.json
 */
declare const content: {
  defaults: {
    newText: string
    newEmoji: string
    [key: string]: string
  }
  design: {
    newDesignName: string
    duplicateSuffix: string
    [key: string]: string
  }
  toasts: {
    designDuplicated: string
    cannotDeleteLast: string
    designDeleted: string
    exportedPng: string
    exportedIco: string
    exportedSvg: string
    exportAll: string
    [key: string]: string
  }
  [key: string]: unknown
}

export default content
