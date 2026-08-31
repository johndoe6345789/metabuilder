import { toCssText } from './css-text'
import type { StyleClassShape } from './types'

/**
 * The tenant's classes as a stylesheet, for a published page to actually use.
 * Class names are restricted to what a CSS selector can safely contain, so a
 * name cannot close the selector and inject rules of its own.
 */
export function styleSheetText(classes: StyleClassShape[]): string {
  return (
    classes
      .filter(css => /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(css.name))
      .filter(css => Object.keys(css.props).length > 0)
      // The selector names the class twice on purpose. Many blocks render
      // components that style their own root, and those styles are also a
      // single class -- so a plain `.name` lost every tie and a style simply
      // did not apply to a button or a chip. Repeating the class doubles
      // specificity, which wins without `!important`: the author keeps the
      // ability to override this again, and nobody has to know the word.
      .map(css => `.${css.name}.${css.name} {\n${toCssText(css.props)}\n}`)
      .join('\n')
  )
}
