/**
 * Playwright global setup
 * Runs before all tests to seed the database with package data
 */

async function globalSetup() {
  // Wait a bit for the server to start
  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    // Seed database with package data
    const response = await fetch('http://localhost:3000/api/setup', {
      method: 'POST',
    })

    if (!response.ok) {
      console.error('Failed to seed database:', response.status, response.statusText)
    } else {
      console.log('Database seeded successfully')
    }
  } catch (error) {
    console.error('Failed to call setup endpoint:', error)
  }
}

export default globalSetup
