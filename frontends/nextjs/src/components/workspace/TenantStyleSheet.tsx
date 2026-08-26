/**
 * The tenant's own CSS classes, on the page.
 *
 * The Styles tab writes StyleRule rows and the builder offers them when
 * setting a component's class, but nothing was turning them into a
 * stylesheet -- so a class applied in the builder rendered unstyled on the
 * published page, and the whole styling path stopped one step short of
 * working.
 *
 * A server component rather than a client effect, so the rules are part of the
 * React tree rather than something bolted on afterwards. They are not in the
 * initial HTML head: this layout awaits a fetch, so Next streams it once the
 * shell has already flushed, and the rules land during hydration. That is not
 * a flash of unstyled content in practice -- a published page fetches its own
 * component tree client-side too, so the styles arrive with the content they
 * style, not after it.
 */

import { loadStyleClasses, styleSheetText } from '@/lib/tenant/style-classes'

const DBAL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  process.env.NEXT_PUBLIC_DBAL_API_URL ??
  'http://localhost:8080'

export async function TenantStyleSheet({ tenant }: { tenant: string }) {
  const classes = await loadStyleClasses(DBAL, tenant)
  const css = styleSheetText(classes)
  if (css === '') return null
  // `precedence` puts this under React's stylesheet management: it is hoisted
  // into <head> on arrival and deduped if two pages ask for the same sheet.
  // "low" keeps tenant classes from silently outranking app styles.
  return (
    <style href={`tenant-styles-${tenant}`} precedence="low">
      {css}
    </style>
  )
}
