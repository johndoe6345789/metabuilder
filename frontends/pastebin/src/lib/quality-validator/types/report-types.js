/**
 * Report format types and error classes for Quality Validation tool
 */
// ============================================================================
// ERROR TYPES
// ============================================================================
export class QualityValidationError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, QualityValidationError.prototype);
    }
}
export class ConfigurationError extends QualityValidationError {
    constructor(message, details) {
        super(message, 'CONFIG_ERROR');
        this.details = details;
        Object.setPrototypeOf(this, ConfigurationError.prototype);
    }
}
export class AnalysisErrorClass extends QualityValidationError {
    constructor(message, details) {
        super(message, 'ANALYSIS_ERROR');
        this.details = details;
        Object.setPrototypeOf(this, AnalysisErrorClass.prototype);
    }
}
export class IntegrationError extends QualityValidationError {
    constructor(message, details) {
        super(message, 'INTEGRATION_ERROR');
        this.details = details;
        Object.setPrototypeOf(this, IntegrationError.prototype);
    }
}
export class ReportingError extends QualityValidationError {
    constructor(message, details) {
        super(message, 'REPORTING_ERROR');
        this.details = details;
        Object.setPrototypeOf(this, ReportingError.prototype);
    }
}
