import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationError, } from '../types/index.js';
import { profileManager } from './ProfileManager';
import { DEFAULT_CONFIG } from './config-defaults.js';
import { loadFromEnvironment } from './config-env.js';
import { deepMerge, validateConfigWeightsAndThresholds, } from './config-merge.js';
export class ConfigLoader {
    constructor() {
        this.getDefaults = () => JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        this.getMinimalConfig = () => JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    static getInstance() {
        if (!ConfigLoader.instance)
            ConfigLoader.instance = new ConfigLoader();
        return ConfigLoader.instance;
    }
    async loadConfiguration(configPath) {
        await profileManager.initialize();
        const base = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        let file = {};
        if (configPath) {
            file = this.loadConfigFile(configPath);
        }
        else {
            for (const loc of ['.qualityrc.json', '.quality/config.json']) {
                if (fs.existsSync(loc)) {
                    file = this.loadConfigFile(loc);
                    break;
                }
            }
        }
        const merged = deepMerge(base, file, loadFromEnvironment());
        validateConfigWeightsAndThresholds(merged);
        const profileName = merged.profile || process.env.QUALITY_PROFILE || 'moderate';
        try {
            merged.scoring.weights = profileManager.getProfile(profileName).weights;
            merged.profile = profileName;
        }
        catch {
            console.warn(`Profile not found: ${profileName}, using defaults`);
        }
        return merged;
    }
    loadConfigFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new ConfigurationError(`Configuration file not found: ${filePath}`, `Looked for: ${path.resolve(filePath)}`);
            }
            const cfg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (typeof cfg !== 'object' || cfg === null) {
                throw new ConfigurationError('Configuration must be a JSON object', `Got: ${typeof cfg}`);
            }
            return cfg;
        }
        catch (e) {
            if (e instanceof ConfigurationError)
                throw e;
            if (e instanceof SyntaxError) {
                throw new ConfigurationError(`Invalid JSON: ${filePath}`, e.message);
            }
            throw new ConfigurationError(`Failed to read: ${filePath}`, e.message);
        }
    }
    applyCliOptions(config, options) {
        const r = JSON.parse(JSON.stringify(config));
        if (options.profile) {
            try {
                r.scoring.weights = profileManager.getProfile(options.profile).weights;
                r.profile = options.profile;
            }
            catch {
                throw new ConfigurationError(`Invalid profile: ${options.profile}`, `Available: ${profileManager.getAllProfileNames().join(', ')}`);
            }
        }
        if (options.skipCoverage)
            r.testCoverage.enabled = false;
        if (options.skipSecurity)
            r.security.enabled = false;
        if (options.skipArchitecture)
            r.architecture.enabled = false;
        if (options.skipComplexity)
            r.codeQuality.enabled = false;
        if (options.noColor)
            r.reporting.colors = false;
        if (options.verbose)
            r.reporting.verbose = true;
        return r;
    }
}
export const configLoader = ConfigLoader.getInstance();
