/**
 * Dependency Container
 * Implements Dependency Injection for quality-validator components
 */
import { AnalyzerFactory } from '../analyzers/AnalyzerFactory.js';
import { logger } from './logger.js';
export class DependencyContainer {
    constructor() {
        this.services = new Map();
        this.config = null;
        this.initializeDefaults();
    }
    initializeDefaults() {
        this.register('logger', logger);
        logger.debug('DependencyContainer initialized');
    }
    register(key, instance) {
        if (this.services.has(key)) {
            logger.warn(`Service '${key}' already registered, overwriting`);
        }
        this.services.set(key, instance);
        logger.debug(`Service registered: ${key}`);
    }
    get(key) {
        const service = this.services.get(key);
        if (!service)
            logger.debug(`Service not found: ${key}`);
        return service;
    }
    has(key) {
        return this.services.has(key);
    }
    setConfiguration(config) {
        this.config = config;
        this.register('config', config);
        logger.debug('Configuration registered in container');
    }
    getConfiguration() {
        return this.config;
    }
    registerAnalyzer(type, config) {
        const analyzer = AnalyzerFactory.create(type, config);
        this.register(`analyzer:${type}`, analyzer);
        return analyzer;
    }
    getAnalyzer(type) {
        return this.get(`analyzer:${type}`);
    }
    registerAllAnalyzers(config) {
        const analyzers = AnalyzerFactory.createAll(config);
        for (const [type, analyzer] of analyzers) {
            this.register(`analyzer:${type}`, analyzer);
        }
        logger.debug('All analyzers registered in container');
        return analyzers;
    }
    getAllAnalyzers() {
        const analyzers = new Map();
        const types = AnalyzerFactory.getRegisteredTypes();
        for (const type of types) {
            const analyzer = this.getAnalyzer(type);
            if (analyzer)
                analyzers.set(type, analyzer);
        }
        return analyzers;
    }
    clear() {
        this.services.clear();
        this.config = null;
        this.initializeDefaults();
        logger.debug('DependencyContainer cleared');
    }
    getServiceKeys() {
        return Array.from(this.services.keys());
    }
    createScope() {
        const child = new DependencyContainer();
        child.config = this.config;
        for (const [key, value] of this.services) {
            if (!key.startsWith('analyzer:')) {
                child.register(key, value);
            }
        }
        logger.debug('Child DependencyContainer scope created');
        return child;
    }
}
let globalContainer = null;
export function getGlobalContainer() {
    if (!globalContainer) {
        globalContainer = new DependencyContainer();
    }
    return globalContainer;
}
export function resetGlobalContainer() {
    globalContainer = null;
    logger.debug('Global DependencyContainer reset');
}
