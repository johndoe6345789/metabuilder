'use client'

/**
 * What a workflow asked the page to do.
 *
 * The daemon cannot reach a DOM, so its `page.*` steps come back as a list
 * of these and the browser applies them. Kept as data on the wire rather
 * than anything executable: a workflow says "set this text", never "run
 * this script", so a compromised or careless workflow cannot do more to
 * the page than the handful of verbs below.
 */
export interface PageEffect {
  do?: unknown
  target?: unknown
  text?: unknown
  class?: unknown
  path?: unknown
}

/** A string prop, or '' when it is missing or not a string. */
function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/**
 * Elements a workflow may not address, whatever its selector says.
 *
 * Setting the text of a <script> or <style> is writing code, not writing
 * copy, and rewriting a form control edits what someone typed. None of
 * these is what the six verbs are for, so the selector does not reach them.
 */
const OFF_LIMITS = new Set([
  'SCRIPT',
  'STYLE',
  'LINK',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'INPUT',
  'TEXTAREA',
  'SELECT',
])

/**
 * Where a workflow may send the browser.
 *
 * `page.go` means "another page of this site", so that is all it can do.
 * Without this the path went straight to location.assign, where a
 * `javascript:` or `data:` URI runs as script -- turning a six-verb
 * vocabulary of data into a way to script somebody's browser.
 *
 * A protocol-relative "//host" is rejected too: it reads like a path and
 * is a different origin.
 */
export function safePath(path: string): string | null {
  const trimmed = path.trim()
  if (!trimmed.startsWith('/')) return null
  if (trimmed.startsWith('//')) return null
  return trimmed
}

/**
 * Elements a workflow may address.
 *
 * querySelectorAll is scoped to the page's own content, not the document,
 * so a selector cannot reach the God Panel chrome or another tenant's
 * embedded anything. A selector matching nothing does nothing, quietly --
 * that is a page that has changed since the workflow was written, not an
 * error worth showing a visitor.
 */
function targets(root: ParentNode, effect: PageEffect): Element[] {
  const selector = str(effect.target)
  if (selector === '') return []
  try {
    return [...root.querySelectorAll(selector)].filter(
      el => !OFF_LIMITS.has(el.tagName)
    )
  } catch {
    // An invalid selector is the author's typo, not the visitor's problem.
    return []
  }
}

/**
 * How far an effect may reach from @p from.
 *
 * The rendered page's own content, found by walking up to the marker
 * UIPageRenderer puts down. Falling back to the document would quietly
 * restore the very thing this exists to prevent, so an unmarked page gets
 * nothing changed instead.
 */
export function effectRoot(from: Element | null): ParentNode | null {
  return from?.closest('[data-page-root]') ?? null
}

export interface EffectOutcome {
  /** Something to show the person who clicked, or null. */
  message: string | null
  /** Where to send them, or null. */
  go: string | null
}

/**
 * Apply @p effects within @p root.
 *
 * Navigation and messages are returned rather than performed: the caller
 * owns the router and the rendering, and a pure application is far easier
 * to be sure of.
 */
export function applyPageEffects(
  root: ParentNode,
  effects: PageEffect[]
): EffectOutcome {
  let message: string | null = null
  let go: string | null = null

  for (const effect of effects) {
    switch (str(effect.do)) {
      case 'page.text':
        for (const el of targets(root, effect)) {
          el.textContent = str(effect.text)
        }
        break
      case 'page.show':
        for (const el of targets(root, effect)) {
          el.removeAttribute('hidden')
        }
        break
      case 'page.hide':
        for (const el of targets(root, effect)) {
          el.setAttribute('hidden', '')
        }
        break
      case 'page.class':
        for (const el of targets(root, effect)) {
          el.classList.add(str(effect.class))
        }
        break
      case 'page.message':
        message = str(effect.text)
        break
      case 'page.go':
        // Null rather than the raw value: an unsafe destination is not a
        // destination, so the caller has nothing to navigate to.
        go = safePath(str(effect.path))
        break
      default:
        // A verb this browser does not know is skipped rather than
        // throwing: an older page must not break on a newer workflow.
        break
    }
  }

  return { message, go }
}
