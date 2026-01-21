/**
 * Type definitions for the Quality Validation CLI Tool
 * Comprehensive interfaces for all analysis, scoring, and reporting
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
export var ExitCode;
(function (ExitCode) {
    ExitCode[ExitCode["SUCCESS"] = 0] = "SUCCESS";
    ExitCode[ExitCode["QUALITY_FAILURE"] = 1] = "QUALITY_FAILURE";
    ExitCode[ExitCode["CONFIGURATION_ERROR"] = 2] = "CONFIGURATION_ERROR";
    ExitCode[ExitCode["EXECUTION_ERROR"] = 3] = "EXECUTION_ERROR";
    ExitCode[ExitCode["KEYBOARD_INTERRUPT"] = 130] = "KEYBOARD_INTERRUPT";
})(ExitCode || (ExitCode = {}));
