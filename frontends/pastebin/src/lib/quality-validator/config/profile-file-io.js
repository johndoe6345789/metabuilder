/**
 * Profile file I/O helpers
 */
import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationError } from '../types/index.js';
const CUSTOM_PATH = '.quality/profiles.json';
export function saveProfileToFile(name, profile) {
    try {
        const dir = path.dirname(CUSTOM_PATH);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        let profiles = {};
        if (fs.existsSync(CUSTOM_PATH)) {
            profiles = JSON.parse(fs.readFileSync(CUSTOM_PATH, 'utf-8'));
        }
        profiles[name] = profile;
        fs.writeFileSync(CUSTOM_PATH, JSON.stringify(profiles, null, 2));
    }
    catch (err) {
        throw new ConfigurationError(`Failed to save profile to ${CUSTOM_PATH}`, err.message);
    }
}
export function removeProfileFromFile(name) {
    try {
        if (!fs.existsSync(CUSTOM_PATH))
            return;
        const profiles = JSON.parse(fs.readFileSync(CUSTOM_PATH, 'utf-8'));
        delete profiles[name];
        fs.writeFileSync(CUSTOM_PATH, JSON.stringify(profiles, null, 2));
    }
    catch (err) {
        throw new ConfigurationError(`Failed to remove profile from ${CUSTOM_PATH}`, err.message);
    }
}
