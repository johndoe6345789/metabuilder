/**
 * Which tenant's site a published page belongs to.
 *
 * A page is served under `{basePath}/{tenant}/...` and Next reports the
 * pathname without the base path, so the first segment is the tenant. Both
 * the nav (to point a link at the right site) and a form (to submit to the
 * right tenant) need this, and neither can be handed it as a prop: a
 * block's render() receives only its own props.
 */

/**
 * The tenant in @p pathname, or empty when there is none -- the root, or a
 * page outside a tenant such as the signup screen. Callers treat empty as
 * "don't know", never as a tenant named "".
 */
export function tenantFromPathname(pathname: string | null): string {
  if (pathname === null) return ''
  // .at() is `string | undefined`; indexing is not, unless
  // noUncheckedIndexedAccess is on -- and it is not in every tsconfig here.
  return pathname.split('/').filter(s => s !== '').at(0) ?? ''
}
