/** The pure rules behind the signup form: slugs, validation, the payload. */

export type TierId = 'starter' | 'creator' | 'studio'

export interface SignupFields {
  community: string
  name: string
  email: string
  password: string
  tier: TierId
}

const MIN_COMMUNITY_LENGTH = 2
const MAX_SLUG_LENGTH = 40

/** A URL-safe slug: lowercase, hyphenated, capped, nothing else. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, MAX_SLUG_LENGTH)
}

/** The complaint about the community name, or null if it is fine. */
export function communityNameError(community: string): string | null {
  if (community.trim().length < MIN_COMMUNITY_LENGTH) {
    return 'Community name must be at least 2 characters.'
  }
  return null
}

/** Whether every required field has something in it. */
export function canSubmit(fields: SignupFields): boolean {
  return (
    fields.community.trim().length > 0 &&
    fields.name.trim().length > 0 &&
    fields.email.trim().length > 0 &&
    fields.password.length > 0
  )
}

/**
 * The registration request body.
 *
 * tenantName founds a real, isolated community: register() creates the
 * User row and DBAL Credential under this exact tenant, DBAL's own OIDC
 * login flow resolves and signs it into the access token from the
 * Credential row, and fetchSession() reads it back from
 * /oidc/userinfo -- so every future login for this account lands back in
 * the same tenant, not a shared one. `plan` (the chosen tier) is still
 * discarded -- provisioning packages for a tier is a separate,
 * not-yet-built feature.
 */
export function buildRegisterPayload(
  fields: SignupFields
): Record<string, string> {
  const slug = slugify(fields.community)
  return {
    username: slug.length > 0 ? slug : fields.name.toLowerCase(),
    email: fields.email,
    password: fields.password,
    tenantName: slug,
    plan: fields.tier,
  }
}
