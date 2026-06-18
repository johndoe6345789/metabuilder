/**
 * Base Analyzer Abstract Class
 * Provides common interface and shared functionality for all analyzers
 * Implements SOLID principles:
 * - Single Responsibility: Base class handles common logic
 * - Open/Closed: Extensible through subclassing
 * - Liskov Substitution: All subclasses can be used interchangeably
 */
import { logger } from '../utils/logger.js';
/**
 * Abstract base class for all analyzers
 */
export class BaseAnalyzer {
    constructor(config) {
        this.startTime = 0;
        this.findings = [];
        this.config = config;
    }
    /**
     * Get analyzer configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Log progress with automatic context
     */
    logProgress(message, context) {
        const executionTime = performance.now() - this.startTime;
        logger.debug(`[${this.config.name}] ${message}`, {
            ...context,
            executionTime: executionTime.toFixed(2) + 'ms',
        });
    }
    /**
     * Record a finding
     */
    addFinding(finding) {
        this.findings.push(finding);
    }
    /**
     * Get all recorded findings
     */
    getFindings() {
        return this.findings;
    }
    /**
     * Clear findings
     */
    clearFindings() {
        this.findings = [];
    }
    /**
     * Determine status based on score
     */
    getStatus(score) {
        if (score >= 80)
            return 'pass';
        if (score >= 70)
            return 'warning';
        return 'fail';
    }
    /**
     * Calculate execution time in milliseconds
     */
    getExecutionTime() {
        return performance.now() - this.startTime;
    }
    /**
     * Start timing
     */
    startTiming() {
        this.startTime = performance.now();
    }
    /**
     * Execute with error handling and timing
     */
    async executeWithTiming(operation, operationName) {
        this.startTiming();
        try {
            this.logProgress(`Starting ${operationName}...`);
            const result = await operation();
            this.logProgress(`${operationName} completed`, {
                success: true,
            });
            return result;
        }
        catch (error) {
            logger.error(`${this.config.name}: ${operationName} failed`, {
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Safe file reading with error handling
     */
    safeReadFile(filePath, operation) {
        try {
            return operation();
        }
        catch (error) {
            this.logProgress(`Failed to read ${filePath}`, {
                error: error.message,
            });
            return null;
        }
    }
    /**
     * Validate configuration
     */
    validateConfig() {
        if (!this.config || !this.config.name) {
            logger.error(`${this.config?.name || 'Unknown'}: Invalid configuration`);
            return false;
        }
        return true;
    }
}
