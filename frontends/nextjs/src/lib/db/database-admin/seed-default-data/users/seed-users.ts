import { getAdapter } from '../../../core/dbal-client'
import { hashPassword } from '../../../password/hash-password'

/**
 * Default users for initial system setup.
 * In production, change these passwords immediately after first login.
 */
const DEFAULT_USERS = [
  {
    id: 'user_supergod',
    username: 'admin',
    email: 'admin@localhost',
    role: 'supergod',
    isInstanceOwner: true,
    password: 'admin123', // Change immediately in production!
  },
  {
    id: 'user_god',
    username: 'god',
    email: 'god@localhost',
    role: 'god',
    isInstanceOwner: false,
    password: 'god123',
  },
  {
    id: 'user_admin',
    username: 'manager',
    email: 'manager@localhost',
    role: 'admin',
    isInstanceOwner: false,
    password: 'manager123',
  },
  {
    id: 'user_demo',
    username: 'demo',
    email: 'demo@localhost',
    role: 'user',
    isInstanceOwner: false,
    password: 'demo123',
  },
]

/**
 * Seed default users and their credentials.
 * Creates users only if they don't already exist.
 */
export async function seedUsers(): Promise<void> {
  const adapter = getAdapter()
  const now = BigInt(Date.now())
  const DEFAULT_TENANT = 'default' // Use 'default' as system tenant for seed data

  for (const userData of DEFAULT_USERS) {
    // Check if user already exists
    const existing = await adapter.findFirst('User', {
      where: { username: userData.username },
    })

    if (existing !== null && existing !== undefined) {
      // User already exists, skip
      continue
    }

    // Create user with default tenant
    await adapter.create('User', {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      isInstanceOwner: userData.isInstanceOwner,
      createdAt: now,
      tenantId: DEFAULT_TENANT, // Use default tenant instead of null
      profilePicture: null,
      bio: null,
    })

    // Create credential for login
    const passwordHash = await hashPassword(userData.password)
    await adapter.create('Credential', {
      id: `cred_${userData.id}`,
      username: userData.username,
      passwordHash,
      userId: userData.id,
    })
  }
}
