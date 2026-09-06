/**
 * Send what a visitor filled in.
 *
 * Creating the row is the whole trigger: DBAL fires
 * `<tenant>.FormSubmission.created` on the write and runs whatever workflow
 * the tenant published for that event. Nothing here knows what the workflow
 * does, which is the point -- the founder changes the workflow in the God
 * Panel and this code does not change with it.
 *
 * There is deliberately no `status` in the payload even though the entity
 * has one: it is a privileged field, so an anonymous write that set it
 * would be refused outright rather than partly applied.
 */

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? '/api/dbal'

export interface SubmitFormRequest {
  tenant: string
  formName: string
  path: string
  values: Record<string, string>
}

export interface SubmitFormResult {
  ok: boolean
  /** Why it did not send, in words a visitor can read. Null when it did. */
  reason: string | null
}

const ok: SubmitFormResult = { ok: true, reason: null }
const failed = (reason: string): SubmitFormResult => ({ ok: false, reason })

/** A stable-ish id without pulling in a uuid dependency for one call. */
function submissionId(): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `fs_${Date.now().toString(36)}_${rand}`
}

export async function submitForm(
  request: SubmitFormRequest
): Promise<SubmitFormResult> {
  if (request.tenant === '') {
    // Without a tenant the row would land under whatever DBAL defaults to,
    // which is somebody else's data. Better to say so than to guess.
    return failed('This form is not attached to a site yet.')
  }

  try {
    const res = await fetch(
      `${DBAL_URL}/${request.tenant}/core/FormSubmission`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: submissionId(),
          tenantId: request.tenant,
          formName: request.formName,
          path: request.path,
          data: request.values,
          createdAt: Math.floor(Date.now() / 1000),
        }),
        signal: AbortSignal.timeout(10000),
      }
    )
    if (res.status === 429) {
      return failed('Too many messages just now. Please try again shortly.')
    }
    if (!res.ok) return failed(`Could not send that (HTTP ${res.status}).`)
    return ok
  } catch {
    // A visitor cannot act on a stack trace; they can act on "try again".
    return failed('Could not reach the site. Please try again.')
  }
}
