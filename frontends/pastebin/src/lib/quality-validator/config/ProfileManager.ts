import * as fs from 'fs';
import { ConfigurationError } from '../types/index.js';
import type {
  ProfileName, EnvironmentType, ProfileDefinition, ProfilesConfig,
} from './profile-types.js';
import { BUILT_IN_PROFILES, loadProfilesFromFile } from './profile-types.js';
import {
  createProfile, updateProfile, deleteProfile,
  exportProfile, importProfile, compareProfiles,
} from './profile-ops.js';

export type {
  ProfileName, EnvironmentType, ProfileDefinition, ProfilesConfig,
} from './profile-types.js';

const ENV_PATHS: Record<EnvironmentType, string> = {
  dev: '.quality/profiles.dev.json',
  staging: '.quality/profiles.staging.json',
  production: '.quality/profiles.prod.json',
};
const CUSTOM_PATH = '.quality/profiles.json';

export class ProfileManager {
  private static instance: ProfileManager;
  private profiles = new Map<string, ProfileDefinition>(
    Object.entries(BUILT_IN_PROFILES)
  );
  private currentProfile: ProfileName = 'moderate';
  private currentEnv: EnvironmentType = this.detectEnv();
  private constructor() {}
  static getInstance(): ProfileManager {
    if (!ProfileManager.instance)
      ProfileManager.instance = new ProfileManager();
    return ProfileManager.instance;
  }
  async initialize(): Promise<void> {
    const ep = ENV_PATHS[this.currentEnv];
    if (ep && fs.existsSync(ep)) {
      try {
        for (const [n, p] of Object.entries(loadProfilesFromFile(ep)))
          this.profiles.set(`${n}-${this.currentEnv}`, p);
      } catch (e) { console.warn(`Env profiles failed: ${ep}`, e); }
    }
    if (fs.existsSync(CUSTOM_PATH)) {
      try {
        for (const [n, p] of Object.entries(loadProfilesFromFile(CUSTOM_PATH)))
          this.profiles.set(n, p);
      }
      catch (e) { console.warn(`Custom profiles failed`, e); }
    }
  }
  getProfile(name: string): ProfileDefinition {
    const p = this.profiles.get(name);
    if (!p) throw new ConfigurationError(
      `Profile not found: ${name}`,
      `Available: ${Array.from(this.profiles.keys()).join(', ')}`
    );
    return JSON.parse(JSON.stringify(p));
  }
  getAllProfileNames = () => Array.from(this.profiles.keys());
  getAllProfiles = () => Array.from(this.profiles.values());
  setCurrentProfile(name: string): void {
    if (!this.profiles.has(name)) throw new ConfigurationError(
      `Cannot set profile: ${name} not found`,
      `Available: ${Array.from(this.profiles.keys()).join(', ')}`
    );
    this.currentProfile = name as ProfileName;
  }
  getCurrentProfile = () => this.getProfile(this.currentProfile);
  getCurrentProfileName = () => this.currentProfile;
  createProfile = (n: string, def: ProfileDefinition, save = true) =>
    createProfile(this.profiles, n, def, save);
  updateProfile = (
    n: string, u: Partial<ProfileDefinition>, save = true
  ): ProfileDefinition =>
    updateProfile(this.profiles, n, u, this.getProfile.bind(this), save);
  deleteProfile = (n: string, del = true) =>
    deleteProfile(this.profiles, n, del);
  isBuiltInProfile = (n: string) =>
    Object.prototype.hasOwnProperty.call(BUILT_IN_PROFILES, n);
  exportProfile = (n: string) => exportProfile(this.getProfile.bind(this), n);
  importProfile = (n: string, json: string, save = true): ProfileDefinition =>
    importProfile(this.profiles, n, json, save);
  compareProfiles = (n1: string, n2: string): Record<string, unknown> =>
    compareProfiles(this.getProfile.bind(this), n1, n2);
  getCurrentEnvironment = () => this.currentEnv;
  setEnvironment = (e: EnvironmentType) => { this.currentEnv = e; };
  getEnvironmentProfiles(env: EnvironmentType): ProfileDefinition[] {
    return Array.from(this.profiles.entries())
      .filter(([n]) => n.endsWith(`-${env}`)).map(([, p]) => p);
  }
  private detectEnv(): EnvironmentType {
    const e = process.env.NODE_ENV || 'dev';
    if (e.includes('production') || e === 'prod') return 'production';
    if (e.includes('staging') || e === 'stage') return 'staging';
    return 'dev';
  }
}

export const profileManager = ProfileManager.getInstance();
