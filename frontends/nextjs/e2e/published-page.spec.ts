import { test, expect, type Page } from '@playwright/test'

/**
 * The visitor's half of the product: what a stranger sees when they follow
 * a link to a community's site.
 *
 * Nothing covered this. The unit suite mocks WorkspacePageSlot,
 * fetchTenantPage and the renderer, so it can say the right props were
 * passed and never that a visitor gets a page -- and every bug here was
 * found by a person clicking, not by a test. What these assert is the
 * document the server actually sent, because that is what a crawler, a
 * link preview and a reader with slow JavaScript all get.
 *
 * Rows come from e2e/dbal-stub.mjs.
 */

const HOME = '/app/harbour_cycle_works'
const RESTRICTED = '/app/harbour_cycle_works/minutes'
const QUIET = '/app/quiet_harbour'

/** The HTML the server sent, before React has hydrated anything. */
async function serverHtml(page: Page, path: string): Promise<string> {
  const response = await page.goto(path)
  return (await response?.text()) ?? ''
}

test.describe('a published home page', () => {
  test('is in the document the server sent, not fetched later', async ({
    page,
  }) => {
    const html = await serverHtml(page, HOME)

    // This route was a client component: the server sent an empty shell
    // and the content arrived only after a browser fetch, so a crawler
    // and a link preview saw nothing at all.
    expect(html).toContain('Wheel building since 1994.')
  })

  test('titles itself with what the founder published', async ({ page }) => {
    await page.goto(HOME)

    // Not "MetaBuilder - Data-Driven Application Platform", which is what
    // every founder's site reported before it could carry metadata.
    await expect(page).toHaveTitle(/Harbour Cycle Works/)
  })

  test('carries a preview card for wherever the link is pasted', async ({
    page,
  }) => {
    const html = await serverHtml(page, HOME)

    expect(html).toContain('og:title')
    expect(html).toContain('Repairs and restorations in Bristol')
  })

  test('renders the blocks the builder wrote, not an error', async ({
    page,
  }) => {
    await page.goto(HOME)

    await expect(
      page.getByRole('heading', { name: 'Harbour Cycle Works' })
    ).toBeVisible()
    await expect(page.getByText('Unknown block')).toHaveCount(0)
  })
})

test.describe('a page the founder restricted', () => {
  test('is not in what the server sends to a stranger', async ({ page }) => {
    const html = await serverHtml(page, RESTRICTED)

    // level arrives as the string "3" from the data layer; read as a
    // number it missed the check and gated at zero, so this whole page
    // was served to anyone with the URL.
    expect(html).not.toContain('Committee pay review')
  })

  test('does not give itself away in the title either', async ({ page }) => {
    const html = await serverHtml(page, RESTRICTED)

    expect(html).not.toContain('Board minutes')
  })
})

test.describe('a community that has published nothing', () => {
  test('says so rather than demanding a sign-in', async ({ page }) => {
    await page.goto(QUIET)

    // The redirect into the panel was unconditional, so a stranger was
    // bounced there and met "Authentication Required" -- the founder's
    // own public URL asking the world to prove who it was.
    await expect(page.getByText('Nothing here yet')).toBeVisible()
    await expect(page.getByText('Authentication Required')).toHaveCount(0)
  })

  test('stays on the address that was followed', async ({ page }) => {
    await page.goto(QUIET)
    await page.waitForTimeout(500)

    expect(page.url()).toContain('/quiet_harbour')
    expect(page.url()).not.toContain('/panel')
  })
})
