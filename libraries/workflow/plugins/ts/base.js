"use strict";
/**
 * Base types and interfaces for TypeScript workflow plugins.
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplateContext = createTemplateContext;
exports.resolveValue = resolveValue;
/**
 * Helper to create a context object for template interpolation.
 */
function createTemplateContext(inputs) {
    return {
        context: inputs.context,
        state: inputs.state,
        json: inputs.context.triggerData,
    };
}
/**
 * Helper to resolve template values.
 */
function resolveValue(value, ctx, interpolate) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        return interpolate(value, ctx);
    }
    return value;
}
//# sourceMappingURL=base.js.map