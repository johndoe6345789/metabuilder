/**
 * Where a nav link actually points once the site is served.
 *
 * A published site lives under `{basePath}/{tenant}/`, but a nav link is
 * written the way anyone would write it -- `/workshop` -- and was emitted
 * verbatim. So every link on every published multi-page site resolved
 * against the origin instead of the site root and answered nginx's 404,
 * including the block's own `Home->/|About->/about|Contact->/contact`
 * default. The pages were fine; only the way between them was broken.
 *
 * Rewriting happens at render rather than when the link is stored, so the
 * saved page stays portable: the same tree published under another tenant,
 * or served from another base path, still points at its own pages.
 */

/** Anything that already names where it goes is left exactly as written. */
function isAbsolute(href: string): boolean {
  return (
    href.startsWith('#') ||
    href.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
  )
}

/**
 * @param href  The link as the author wrote it.
 * @param base  The site root, e.g. `/app/harbour_cycle_works`. An empty
 *              base leaves every link alone -- that is the case where the
 *              tenant could not be worked out, and a wrong prefix would be
 *              worse than none.
 */
export function resolveNavHref(href: string, base: string): string {
  const trimmed = href.trim()
  if (trimmed === '' || base === '') return trimmed
  if (isAbsolute(trimmed)) return trimmed
  // Relative links already resolve against the current page.
  if (!trimmed.startsWith('/')) return trimmed
  // The site root itself: `/` must not become `/app/tenant/`, whose
  // trailing slash is a different route to Next than the bare path.
  if (trimmed === '/') return base
  return `${base}${trimmed}`
}

/**
 * The site root for a page at @p pathname, which Next reports without the
 * base path. The first segment is the tenant; anything with no segments
 * (or a pathname from outside a tenant, such as the signup page) yields an
 * empty base so resolveNavHref leaves links untouched.
 */
export function navBaseFromPathname(
  pathname: string | null,
  basePath: string
): string {
  // usePathname() is typed `string`, but answers null outside a router --
  // every unit test that renders a nav, and any render outside the shell.
  if (pathname === null) return ''
  // .at() is `string | undefined`; indexing is not, unless
  // noUncheckedIndexedAccess is on -- and it is not in every tsconfig here.
  const tenant = pathname.split('/').filter(s => s !== '').at(0)
  if (tenant === undefined) return ''
  return `${basePath}/${tenant}`
}
