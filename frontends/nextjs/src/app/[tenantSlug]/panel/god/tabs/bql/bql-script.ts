/**
 * One named BQL script. Its own module because the god slice stores these
 * and the hook that edits them reads the slice -- importing the type from
 * the hook would make that a cycle.
 */
export interface BqlScript {
  id: string
  name: string
  text: string
}
