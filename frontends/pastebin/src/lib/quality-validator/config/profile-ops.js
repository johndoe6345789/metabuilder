import { ConfigurationError } from '../types/index.js';
import { BUILT_IN_PROFILES } from './profile-types.js';
import { validateProfile } from './profile-validator.js';
import { saveProfileToFile, removeProfileFromFile } from './profile-file-io.js';
export function createProfile(profiles, name, definition, saveToFile = true) {
    validateProfile(definition);
    if (profiles.has(name)) {
        throw new ConfigurationError(`Profile already exists: ${name}`, 'Use a different name or delete the existing profile');
    }
    profiles.set(name, definition);
    if (saveToFile)
        saveProfileToFile(name, definition);
    return definition;
}
export function updateProfile(profiles, name, updates, getProfile, saveToFile = true) {
    const updated = { ...getProfile(name), ...updates };
    validateProfile(updated);
    profiles.set(name, updated);
    if (saveToFile)
        saveProfileToFile(name, updated);
    return updated;
}
export function deleteProfile(profiles, name, deleteFromFile = true) {
    if (Object.prototype.hasOwnProperty.call(BUILT_IN_PROFILES, name)) {
        throw new ConfigurationError(`Cannot delete built-in profile: ${name}`, 'Only custom profiles can be deleted');
    }
    if (!profiles.has(name)) {
        throw new ConfigurationError(`Profile not found: ${name}`, '');
    }
    profiles.delete(name);
    if (deleteFromFile)
        removeProfileFromFile(name);
}
export function exportProfile(getProfile, name) {
    return JSON.stringify(getProfile(name), null, 2);
}
export function importProfile(profiles, name, jsonString, saveToFile = true) {
    try {
        const profile = JSON.parse(jsonString);
        validateProfile(profile);
        return createProfile(profiles, name, profile, saveToFile);
    }
    catch (err) {
        if (err instanceof ConfigurationError)
            throw err;
        if (err instanceof SyntaxError) {
            throw new ConfigurationError('Invalid JSON in profile import', err.message);
        }
        throw err;
    }
}
export function compareProfiles(getProfile, name1, name2) {
    const p1 = getProfile(name1);
    const p2 = getProfile(name2);
    const diff = (a, b) => ({
        codeQuality: Math.abs(a.codeQuality - b.codeQuality),
        testCoverage: Math.abs(a.testCoverage - b.testCoverage),
        architecture: Math.abs(a.architecture - b.architecture),
        security: Math.abs(a.security - b.security),
    });
    return {
        profile1Name: name1,
        profile2Name: name2,
        weights: {
            profile1: p1.weights,
            profile2: p2.weights,
            differences: diff(p1.weights, p2.weights),
        },
        minimumScores: {
            profile1: p1.minimumScores,
            profile2: p2.minimumScores,
            differences: diff(p1.minimumScores, p2.minimumScores),
        },
    };
}
