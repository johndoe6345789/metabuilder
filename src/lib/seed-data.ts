import { initializeAllSeedData } from '@/seed-data'

export async function seedDatabase() {
  await initializeAllSeedData()
}
