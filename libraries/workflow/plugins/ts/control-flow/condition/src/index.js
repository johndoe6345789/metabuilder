"use strict";
/**
 * Condition Node Executor Plugin
 * Evaluates conditions and routes execution to different paths
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.conditionExecutor = exports.ConditionExecutor = void 0;
const workflow_1 = require("@metabuilder/workflow");
class ConditionExecutor {
    constructor() {
        this.nodeType = 'condition';
    }
    async execute(node, context, state) {
        const startTime = Date.now();
        try {
            const { condition } = node.parameters;
            if (!condition) {
                throw new Error('Condition node requires "condition" parameter');
            }
            const result = (0, workflow_1.evaluateTemplate)(condition, { context, state, json: context.triggerData });
            const duration = Date.now() - startTime;
            return {
                status: 'success',
                output: {
                    result: Boolean(result),
                    condition,
                    evaluated: true
                },
                timestamp: Date.now(),
                duration
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                errorCode: 'CONDITION_EVAL_ERROR',
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
        }
    }
    validate(node) {
        const errors = [];
        const warnings = [];
        if (!node.parameters.condition) {
            errors.push('Condition is required');
        }
        const condition = node.parameters.condition || '';
        if (condition.includes('==') && !condition.includes('===')) {
            warnings.push('Consider using === instead of == for strict equality');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.ConditionExecutor = ConditionExecutor;
exports.conditionExecutor = new ConditionExecutor();
//# sourceMappingURL=index.js.map