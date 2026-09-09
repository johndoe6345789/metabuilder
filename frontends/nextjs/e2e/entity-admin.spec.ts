import { test, expect, type Page } from '@playwright/test'

/**
 * The generic entity admin at /{tenant}/{package}/{entity}.
 *
 * Every page of it answered "Error loading data: Authentication required"
 * to a signed-in founder: `entityApiFetch` forwards the session cookie so
 * a Server Component can call this app's own API as the visitor, and
 * `getSessionUser` read only the Authorization header. Nothing caught it
 * because the unit tests mock the fetch on both sides -- the two halves
 * disagreed, and each half's tests agreed with itself.
 *
 * These drive the real server: the cookie goes in, the page comes back.
 * Rows come from e2e/dbal-stub.mjs.
 */

const LIST = '/app/harbour_cycle_works/core/User'

/** An unsigned token with a future exp; the stub vouches for any token. */
function sessionToken(): string {
  const encode = (value: object): string =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + 3600
  return [
    encode({ alg: 'none', typ: 'JWT' }),
    encode({ sub: 'harbour-cycle-works', exp }),
    'not-verified',
  ].join('.')
}

async function signIn(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'mb_session',
      value: sessionToken(),
      domain: 'localhost',
      path: '/',
    },
  ])
}

test.describe('the entity admin', () => {
  test('lists rows for a signed-in operator', async ({ page }) => {
    await signIn(page)
    await page.goto(LIST)

    await expect(page.getByText('Authentication required')).toHaveCount(0)
    await expect(page.getByRole('table')).toBeVisible()
  })

  /**
   * The columns came from a schema loaded out of a package directory, so
   * for an entity outside one the table was a header of nothing but
   * "Actions" over an empty row per record.
   */
  test('shows the rows themselves, not just an Actions column', async ({
    page,
  }) => {
    await signIn(page)
    await page.goto(LIST)

    await expect(page.getByRole('columnheader', { name: 'id' })).toBeVisible()
  })

  test('refuses a visitor with no session', async ({ page }) => {
    await page.goto(LIST)

    await expect(page.getByText('Authentication required')).toBeVisible()
  })

  test('offers a create form that can be submitted', async ({ page }) => {
    await signIn(page)
    await page.goto(`${LIST}/new`)

    // The button used to be a type="button" with no handler at all.
    const submit = page.getByRole('button', { name: /Create User/ })
    await expect(submit).toBeVisible()
    await expect(submit).toHaveAttribute('type', 'submit')
  })
})
