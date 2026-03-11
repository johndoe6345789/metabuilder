/**
 * Playwright global setup
 * Runs before all tests to seed the database with package data
 */

async function globalSetup() {
  // Wait a bit for the server to start
  await new Promise(resolve => setTimeout(resolve, 2000))

  const setupUrl = process.env.PLAYWRIGHT_BASE_URL
    ? new URL('/api/setup', process.env.PLAYWRIGHT_BASE_URL.replace(/\/workflowui\/?$/, '')).href
    : 'http://localhost:3000/api/setup'

  try {
    // Seed database with package data
    const response = await fetch(setupUrl, {
      method: 'POST',
    })

    if (!response.ok) {
      console.error('Failed to seed database:', response.status, response.statusText)
    } else {
      console.log('Database seeded successfully')
    }
  } catch (error) {
    // Setup endpoint may not exist in all environments (e.g. CI smoke stack)
    console.warn('Setup endpoint not available (non-fatal):', (error as Error).message)
  }
}

export default globalSetup
