// Mock CSS/SCSS modules globally
import { vi } from 'vitest'

// Return a proxy that returns the property name as the class name
const cssProxy = new Proxy({}, {
  get: (_target, prop) => prop.toString(),
})

vi.mock('../QueryConsole.module.scss', () => ({ default: cssProxy }))
vi.mock('./QueryConsole.module.scss', () => ({ default: cssProxy }))
vi.mock('../DaemonPage.module.scss', () => ({ default: cssProxy }))
vi.mock('./DaemonPage.module.scss', () => ({ default: cssProxy }))
vi.mock('../NavTabs.module.scss', () => ({ default: cssProxy }))
vi.mock('../ServerStatusPanel.module.scss', () => ({ default: cssProxy }))
