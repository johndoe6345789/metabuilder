/**
 * What a signed-out visitor may create.
 *
 * The proxy blocks anonymous writes wholesale because, when it was
 * written, DBAL did not enforce the ACLs its schemas declared. It does
 * now -- write_authz_rejection honours acl.create.public and refuses any
 * privileged field an anonymous caller tries to set. But "DBAL will
 * decide" is a worse rule to hold in your head than a list you can read,
 * so this stays an explicit statement of the entities a stranger may
 * write to, and DBAL enforces it a second time regardless.
 *
 * The one entry is the entity whose whole purpose is to be created by
 * someone with no account: answering a form on a published page. Adding
 * to this list means deciding that a stranger may create rows of that
 * kind *in any community*, since the tenant comes from the path -- so
 * keep it short and keep it deliberate.
 *
 * `User` used to be here for registration's sake, and registration never
 * needed it: lib/auth/api/register.ts talks to DBAL directly through
 * DBAL_ENDPOINT with the admin token, not through this proxy. What the
 * entry did allow was a stranger POSTing a User row into somebody else's
 * community -- and, since tenant-exists.ts decides a tenant is real if it
 * has any users, conjuring a tenant out of a made-up slug.
 *
 * Only POST is opened. Editing and deleting an existing row are never
 * anonymous, whatever the entity -- a visitor may say something, not go
 * back and change what they said.
 */

/** Entity names, matched against the last segment of the DBAL path. */
const PUBLICLY_CREATABLE = new Set(['FormSubmission'])

/**
 * Whether @p method on @p path may proceed without a session.
 *
 * @param path The DBAL path, `{tenant}/{package}/{Entity}`.
 */
export function isPublicWrite(method: string, path: string): boolean {
  if (method !== 'POST') return false
  const segments = path.split('/').filter(s => s !== '')
  // Exactly three: a POST to the collection. Anything longer addresses a
  // particular row or an action on one, which is not a create.
  if (segments.length !== 3) return false
  const entity = segments[2]
  return PUBLICLY_CREATABLE.has(entity)
}
