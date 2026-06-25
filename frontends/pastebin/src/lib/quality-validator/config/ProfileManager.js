import * as fs from 'fs';
import { ConfigurationError } from '../types/index.js';
import { BUILT_IN_PROFILES, loadProfilesFromFile } from './profile-types.js';
import { createProfile, updateProfile, deleteProfile, exportProfile, importProfile, compareProfiles, } from './profile-ops.js';
const ENV_PATHS = {
    dev: '.quality/profiles.dev.json',
    staging: '.quality/profiles.staging.json',
    production: '.quality/profiles.prod.json',
};
const CUSTOM_PATH = '.quality/profiles.json';
export class ProfileManager {
    constructor() {
        this.profiles = new Map(Object.entries(BUILT_IN_PROFILES));
        this.currentProfile = 'moderate';
        this.currentEnv = this.detectEnv();
        this.getAllProfileNames = () => Array.from(this.profiles.keys());
        this.getAllProfiles = () => Array.from(this.profiles.values());
        this.getCurrentProfile = () => this.getProfile(this.currentProfile);
        this.getCurrentProfileName = () => this.currentProfile;
        this.createProfile = (n, def, save = true) => createProfile(this.profiles, n, def, save);
        this.updateProfile = (n, u, save = true) => updateProfile(this.profiles, n, u, this.getProfile.bind(this), save);
        this.deleteProfile = (n, del = true) => deleteProfile(this.profiles, n, del);
        this.isBuiltInProfile = (n) => Object.prototype.hasOwnProperty.call(BUILT_IN_PROFILES, n);
        this.exportProfile = (n) => exportProfile(this.getProfile.bind(this), n);
        this.importProfile = (n, json, save = true) => importProfile(this.profiles, n, json, save);
        this.compareProfiles = (n1, n2) => compareProfiles(this.getProfile.bind(this), n1, n2);
        this.getCurrentEnvironment = () => this.currentEnv;
        this.setEnvironment = (e) => {
            this.currentEnv = e;
        };
    }
    static getInstance() {
        if (!ProfileManager.instance)
            ProfileManager.instance = new ProfileManager();
        return ProfileManager.instance;
    }
    async initialize() {
        const ep = ENV_PATHS[this.currentEnv];
        if (ep && fs.existsSync(ep)) {
            try {
                for (const [n, p] of Object.entries(loadProfilesFromFile(ep)))
                    this.profiles.set(`${n}-${this.currentEnv}`, p);
            }
            catch (e) {
                console.warn(`Env profiles failed: ${ep}`, e);
            }
        }
        if (fs.existsSync(CUSTOM_PATH)) {
            try {
                for (const [n, p] of Object.entries(loadProfilesFromFile(CUSTOM_PATH)))
                    this.profiles.set(n, p);
            }
            catch (e) {
                console.warn(`Custom profiles failed`, e);
            }
        }
    }
    getProfile(name) {
        const p = this.profiles.get(name);
        if (!p)
            throw new ConfigurationError(`Profile not found: ${name}`, `Available: ${Array.from(this.profiles.keys()).join(', ')}`);
        return JSON.parse(JSON.stringify(p));
    }
    setCurrentProfile(name) {
        if (!this.profiles.has(name))
            throw new ConfigurationError(`Cannot set profile: ${name} not found`, `Available: ${Array.from(this.profiles.keys()).join(', ')}`);
        this.currentProfile = name;
    }
    getEnvironmentProfiles(env) {
        return Array.from(this.profiles.entries())
            .filter(([n]) => n.endsWith(`-${env}`))
            .map(([, p]) => p);
    }
    detectEnv() {
        const e = process.env.NODE_ENV || 'dev';
        if (e.includes('production') || e === 'prod')
            return 'production';
        if (e.includes('staging') || e === 'stage')
            return 'staging';
        return 'dev';
    }
}
export const profileManager = ProfileManager.getInstance();
