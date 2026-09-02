import { useState } from 'react'
import type { CssClass } from '../styles/use-css-classes'

/** Whether the "type a class name" escape hatch is open. Defaults to open
 *  only when a class already on the node isn't one the Styles tab
 *  recognises -- and only once that list has actually loaded, since an
 *  empty list before hydration would otherwise make every applied class
 *  look unknown and force the disclosure open for everyone, every time.
 *  Once the caller toggles it by hand, that choice sticks regardless of
 *  what "unknown" does afterwards. */
export function useAdvancedClassesOpen(
  applied: string[],
  classes: CssClass[]
): [boolean, () => void] {
  const [override, setOverride] = useState<boolean | null>(null)
  const hasUnknown =
    classes.length > 0 &&
    applied.some(name => !classes.some(css => css.name === name))
  const open = override ?? hasUnknown

  return [
    open,
    () => {
      setOverride(!open)
    },
  ]
}
