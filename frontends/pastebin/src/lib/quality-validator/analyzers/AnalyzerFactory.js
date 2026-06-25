import { CodeQualityAnalyzer } from './codeQualityAnalyzer.js';
import { CoverageAnalyzer } from './coverageAnalyzer.js';
import { ArchitectureChecker } from './architectureChecker.js';
import { SecurityScanner } from './securityScanner.js';
import { logger } from '../utils/logger.js';
export class AnalyzerFactory {
    static registerAnalyzer(type, constructor) {
        if (AnalyzerFactory.analyzers.has(type)) {
            logger.warn(`Analyzer type '${type}' is already registered, overwriting...`);
        }
        AnalyzerFactory.analyzers.set(type, constructor);
        logger.debug(`Registered analyzer type: ${type}`);
    }
    static create(type, config) {
        const constructor = AnalyzerFactory.analyzers.get(type);
        if (!constructor) {
            throw new Error(
            // eslint-disable-next-line max-len
            `Unknown analyzer type: ${type}. Registered types: ${Array.from(AnalyzerFactory.analyzers.keys()).join(', ')}`);
        }
        logger.debug(`Creating analyzer instance: ${type}`);
        return new constructor(config);
    }
    static getInstance(type, config) {
        if (!AnalyzerFactory.instances.has(type)) {
            AnalyzerFactory.instances.set(type, AnalyzerFactory.create(type, config));
        }
        return AnalyzerFactory.instances.get(type);
    }
    static getRegisteredTypes() {
        return Array.from(AnalyzerFactory.analyzers.keys());
    }
    static clearInstances() {
        AnalyzerFactory.instances.clear();
        logger.debug('Cleared analyzer singleton instances');
    }
    static createAll(config) {
        const analyzers = new Map();
        for (const type of AnalyzerFactory.getRegisteredTypes()) {
            analyzers.set(type, AnalyzerFactory.create(type, config));
        }
        return analyzers;
    }
}
AnalyzerFactory.analyzers = new Map();
AnalyzerFactory.instances = new Map();
(() => {
    AnalyzerFactory.registerAnalyzer('codeQuality', CodeQualityAnalyzer);
    AnalyzerFactory.registerAnalyzer('coverage', CoverageAnalyzer);
    AnalyzerFactory.registerAnalyzer('architecture', ArchitectureChecker);
    AnalyzerFactory.registerAnalyzer('security', SecurityScanner);
})();
