import { test, expect, type Route } from '@playwright/test'

// Mock session so LevelGate passes (role=user → level 2)
async function mockAuth(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      user: {
        id: 'test-1',
        username: 'tester',
        role: 'moderator',
        email: 't@test.com',
      },
    }),
  })
}

// Mock DBAL health so OverviewTab doesn't stall
async function mockDbal(route: Route) {
  await route.fulfill({ status: 503 })
}

// Mock media daemon — retro session creation
async function mockRetroSession(route: Route) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 'nes_test123',
      system: 'nes',
      romPath: 'http://localhost:9000/games/mario.nes',
      streamUrl: 'http://localhost:8088/hls/retro/nes_test123/index.m3u8',
      startedAt: '1751500000',
    }),
  })
}

// The auth store only requests /api/auth/session when a persisted session
// exists: refresh() reads sessionStorage first and returns early when it finds
// nothing, leaving user null. Mocking the endpoint alone therefore did nothing,
// LevelGate blocked the page, and no tabs ever rendered. Seed a session so the
// store gets as far as the mock. isTokenValid only decodes the payload and
// compares exp, so an unsigned token is enough.
const SESSION_STORAGE_KEY = 'nextjs-web-sso'

/**
 * The page is tenant-scoped -- app/[tenantSlug]/panel/media-center -- so
 * '/app/media-center' has not existed since panel routes moved under a
 * tenant. It answered Next's 404, and every locator then failed with
 * "element(s) not found", which reads like the page rendering wrong rather
 * than never having been asked for. The tenant segment is only a route
 * param here; the page gates on level, not on which tenant it is.
 */
const MEDIA_CENTRE = '/app/system/panel/media-center'

function makeSessionToken(): string {
  const encode = (value: object): string =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + 3600
  return [
    encode({ alg: 'none', typ: 'JWT' }),
    encode({ sub: 'test-1', exp }),
    'not-verified',
  ].join('.')
}

test.describe('Media Centre', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ([key, token]) => {
        const session = { token, refreshToken: null }
        sessionStorage.setItem(key, JSON.stringify(session))
      },
      [SESSION_STORAGE_KEY, makeSessionToken()] as const
    )
    await page.route('**/api/auth/session', mockAuth)
    await page.route('**/api/auth/logout', r =>
      r.fulfill({ status: 200, body: '{}' })
    )
    await page.route('**/health**', mockDbal)
  })

  test('page loads with three tabs', async ({ page }) => {
    await page.goto(MEDIA_CENTRE)
    await expect(page.getByRole('tab', { name: 'Video' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Audio' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Retro Gaming' })).toBeVisible()
    await expect(page.getByText('Media Centre')).toBeVisible()
  })

  test('video tab — enters URL and Load button appears', async ({ page }) => {
    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Video' }).click()

    const input = page.getByPlaceholder(/localhost:9000.*mp4/i)
    await expect(input).toBeVisible()

    const loadBtn = page.getByRole('button', { name: 'Load' }).first()
    await expect(loadBtn).toBeDisabled()

    await input.fill('http://localhost:9000/media/demo.mp4')
    await expect(loadBtn).toBeEnabled()
  })

  test('video tab — loads video element on Load click', async ({ page }) => {
    // Intercept the video request so we don't need real media
    await page.route('**/demo.mp4', async route => {
      // Return a tiny valid mp4 stub (just enough to create the element)
      await route.fulfill({ status: 200, contentType: 'video/mp4', body: '' })
    })

    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Video' }).click()

    await page
      .getByPlaceholder(/localhost:9000.*mp4/i)
      .fill('http://localhost:9000/media/demo.mp4')
    await page.getByRole('button', { name: 'Load' }).first().click()

    await expect(page.locator('video')).toBeVisible()
    const src = await page.locator('video').getAttribute('src')
    expect(src).toContain('demo.mp4')
  })

  test('audio tab — shows player when URL entered', async ({ page }) => {
    await page.route('**/track.mp3', r =>
      r.fulfill({ status: 200, contentType: 'audio/mpeg', body: '' })
    )

    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Audio' }).click()

    await page
      .getByPlaceholder(/localhost:9000.*mp3/i)
      .fill('http://localhost:9000/music/track.mp3')
    await page.getByRole('button', { name: 'Load' }).first().click()

    await expect(page.locator('audio')).toBeAttached()
    await expect(
      page
        .locator('.material-symbols-rounded')
        .filter({ hasText: 'play_arrow' })
    ).toBeVisible()
  })

  test('audio tab — LIVE badge shown for Icecast stream URL', async ({
    page,
  }) => {
    await page.route('**/stream/radio1**', r =>
      r.fulfill({ status: 200, contentType: 'audio/mpeg', body: '' })
    )

    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Audio' }).click()

    await page
      .getByPlaceholder(/localhost:9000.*mp3/i)
      .fill('http://localhost:8090/stream/radio1')
    await page.getByRole('button', { name: 'Load' }).first().click()

    await expect(page.getByText('LIVE')).toBeVisible()
  })

  test('retro tab — shows system picker with 8 systems', async ({ page }) => {
    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Retro Gaming' }).click()

    await expect(
      page.getByRole('button', { name: 'NES 1983', exact: true })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /SNES/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /GBA/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /PS1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /N64/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Arcade/i })).toBeVisible()
  })

  test('retro tab — Launch button disabled until system + URL both set', async ({
    page,
  }) => {
    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Retro Gaming' }).click()

    const launchBtn = page.getByRole('button', { name: /Launch/i })
    await expect(launchBtn).toBeDisabled()

    // Select NES only — still disabled (no ROM URL)
    await page.getByRole('button', { name: 'NES 1983', exact: true }).click()
    await expect(launchBtn).toBeDisabled()

    // Add ROM URL — now enabled
    await page
      .getByPlaceholder(/localhost:9000.*nes/i)
      .fill('http://localhost:9000/games/mario.nes')
    await expect(launchBtn).toBeEnabled()
  })

  test('retro tab — Launch sends POST to media daemon and shows stream', async ({
    page,
  }) => {
    await page.route('**/api/retro/sessions', mockRetroSession)
    await page.route('**/index.m3u8', r => r.fulfill({ status: 404, body: '' }))

    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Retro Gaming' }).click()

    await page.getByRole('button', { name: 'NES 1983', exact: true }).click()
    await page
      .getByPlaceholder(/localhost:9000.*nes/i)
      .fill('http://localhost:9000/games/mario.nes')

    await page.getByRole('button', { name: /Launch NES/i }).click()

    // Video player should appear with the stream
    await expect(page.locator('video')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/NES — session nes_test/)).toBeVisible()

    // Stop session button should appear
    await expect(
      page.getByRole('button', { name: 'Stop session' })
    ).toBeVisible()
  })

  test('retro tab — Stop session clears the player', async ({ page }) => {
    await page.route('**/api/retro/sessions', mockRetroSession)
    await page.route('**/api/retro/sessions/**', r =>
      r.fulfill({ status: 204, body: '' })
    )
    await page.route('**/index.m3u8', r => r.fulfill({ status: 404, body: '' }))

    await page.goto(MEDIA_CENTRE)
    await page.getByRole('tab', { name: 'Retro Gaming' }).click()
    await page.getByRole('button', { name: 'NES 1983', exact: true }).click()
    await page
      .getByPlaceholder(/localhost:9000.*nes/i)
      .fill('http://localhost:9000/games/mario.nes')
    await page.getByRole('button', { name: /Launch NES/i }).click()
    await expect(page.locator('video')).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: 'Stop session' }).click()

    // Back to system picker
    await expect(
      page.getByRole('button', { name: 'NES 1983', exact: true })
    ).toBeVisible()
    await expect(page.locator('video')).not.toBeAttached()
  })
})
