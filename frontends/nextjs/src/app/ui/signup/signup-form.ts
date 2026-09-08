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

/**
 * The tenant a community name becomes -- what the URL will actually say.
 *
 * DBAL's route parser accepts only alphanumerics and underscores in a
 * tenant segment, so the hyphenated slug is written with underscores.
 * Derived here, once, because the signup screen showed the founder
 * metabuilder.app/acme-running-club while creating acme_running_club --
 * the one URL it promised was the one URL that could not work, and it was
 * missing the /app basePath as well.
 */
export function tenantNameFor(community: string): string {
  return slugify(community).replaceAll('-', '_')
}

/** A URL-safe slug: lowercase, hyphenated, capped, nothing else. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, MAX_SLUG_LENGTH)
}

/**
 * The complaint about the community name, or null if it is fine.
 *
 * The slug is what is checked, not the raw string. This counted raw
 * characters while slugify strips everything outside [a-z0-9-], so a name
 * made only of punctuation or of non-Latin script passed, slugged to '',
 * and was sent as `tenantName: ''`. register() reads an empty tenantName
 * as "no community was named": it skips the already-taken check entirely
 * and creates the account with role 'god' inside the shared 'system'
 * tenant -- a founder who meant to start their own community handed the
 * God Panel over everyone else's.
 */
export function communityNameError(community: string): string | null {
  if (community.trim().length < MIN_COMMUNITY_LENGTH) {
    return 'Community name must be at least 2 characters.'
  }
  // Hyphens survive slugging but cannot carry a name on their own, so they
  // do not count towards the minimum.
  if (slugify(community).replaceAll('-', '').length < MIN_COMMUNITY_LENGTH) {
    return 'Community name needs at least 2 letters or numbers.'
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
    // DBAL's route parser only accepts alphanumeric + underscore in a
    // tenant path segment -- a hyphenated slug 400s with "Invalid tenant
    // name" the moment it's used as one.
    tenantName: tenantNameFor(fields.community),
    plan: fields.tier,
  }
}
