"use strict";
/**
 * Wait Node Executor Plugin
 * Pauses execution for a specified duration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitExecutor = exports.WaitExecutor = void 0;
class WaitExecutor {
    constructor() {
        this.nodeType = 'wait';
    }
    async execute(node, context, state) {
        const startTime = Date.now();
        try {
            const { duration, unit } = node.parameters;
            if (duration === undefined) {
                throw new Error('Wait node requires "duration" parameter');
            }
            const unitMap = {
                ms: 1,
                second: 1000,
                seconds: 1000,
                minute: 60000,
                minutes: 60000,
                hour: 3600000,
                hours: 3600000
            };
            const multiplier = unitMap[unit || 'seconds'] || 1000;
            const waitMs = duration * multiplier;
            await new Promise((resolve) => setTimeout(resolve, waitMs));
            const actualDuration = Date.now() - startTime;
            return {
                status: 'success',
                output: {
                    waited: true,
                    duration: actualDuration,
                    unit: unit || 'ms'
                },
                timestamp: Date.now(),
                duration: actualDuration
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                errorCode: 'WAIT_ERROR',
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
        }
    }
    validate(node) {
        const errors = [];
        const warnings = [];
        if (node.parameters.duration === undefined) {
            errors.push('Duration is required');
        }
        if (node.parameters.duration && node.parameters.duration > 3600) {
            warnings.push('Wait duration exceeds 1 hour - consider using schedule trigger instead');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.WaitExecutor = WaitExecutor;
exports.waitExecutor = new WaitExecutor();
//# sourceMappingURL=index.js.map