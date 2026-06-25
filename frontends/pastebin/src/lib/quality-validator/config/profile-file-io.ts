/**
 * Profile file I/O helpers
 */

import * as fs from 'fs'
import * as path from 'path'
import { ConfigurationError } from '../types/index.js'
import type { ProfileDefinition, ProfilesConfig } from './profile-types.js'

const CUSTOM_PATH = '.quality/profiles.json'

export function saveProfileToFile(
  name: string,
  profile: ProfileDefinition,
): void {
  try {
    const dir = path.dirname(CUSTOM_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    let profiles: ProfilesConfig = {}
    if (fs.existsSync(CUSTOM_PATH)) {
      profiles = JSON.parse(fs.readFileSync(CUSTOM_PATH, 'utf-8'))
    }
    profiles[name] = profile
    fs.writeFileSync(CUSTOM_PATH, JSON.stringify(profiles, null, 2))
  } catch (err) {
    throw new ConfigurationError(
      `Failed to save profile to ${CUSTOM_PATH}`,
      (err as Error).message,
    )
  }
}

export function removeProfileFromFile(name: string): void {
  try {
    if (!fs.existsSync(CUSTOM_PATH)) return
    const profiles = JSON.parse(
      fs.readFileSync(CUSTOM_PATH, 'utf-8'),
    ) as ProfilesConfig
    delete profiles[name]
    fs.writeFileSync(CUSTOM_PATH, JSON.stringify(profiles, null, 2))
  } catch (err) {
    throw new ConfigurationError(
      `Failed to remove profile from ${CUSTOM_PATH}`,
      (err as Error).message,
    )
  }
}
