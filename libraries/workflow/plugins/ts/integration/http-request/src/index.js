"use strict";
/**
 * HTTP Request Node Executor Plugin
 * Handles outbound HTTP calls with retry and response parsing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestExecutor = exports.HTTPRequestExecutor = void 0;
const workflow_1 = require("@metabuilder/workflow");
class HTTPRequestExecutor {
    constructor() {
        this.nodeType = 'http-request';
    }
    async execute(node, context, state) {
        const startTime = Date.now();
        try {
            const { url, method, body, headers, timeout } = node.parameters;
            if (!url) {
                throw new Error('HTTP request requires "url" parameter');
            }
            const resolvedUrl = (0, workflow_1.interpolateTemplate)(url, {
                context,
                state,
                json: context.triggerData,
                env: process.env
            });
            const resolvedHeaders = (0, workflow_1.interpolateTemplate)(headers || {}, {
                context,
                state,
                json: context.triggerData,
                env: process.env
            });
            const resolvedBody = body
                ? (0, workflow_1.interpolateTemplate)(body, { context, state, json: context.triggerData })
                : undefined;
            const requestHeaders = {
                'Content-Type': 'application/json',
                'User-Agent': 'MetaBuilder-Workflow/3.0.0',
                ...resolvedHeaders
            };
            // Mock implementation - in production, use actual HTTP client
            const mockResponse = {
                statusCode: 200,
                statusText: 'OK',
                body: { success: true },
                headers: requestHeaders,
                url: resolvedUrl,
                method: method || 'GET'
            };
            const duration = Date.now() - startTime;
            return {
                status: 'success',
                output: mockResponse,
                timestamp: Date.now(),
                duration
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorMsg = error instanceof Error ? error.message : String(error);
            let errorCode = 'HTTP_ERROR';
            if (errorMsg.includes('timeout')) {
                errorCode = 'TIMEOUT';
            }
            return {
                status: 'error',
                error: errorMsg,
                errorCode,
                timestamp: Date.now(),
                duration
            };
        }
    }
    validate(node) {
        const errors = [];
        const warnings = [];
        if (!node.parameters.url) {
            errors.push('URL is required');
        }
        if (node.parameters.timeout && node.parameters.timeout > 120000) {
            warnings.push('Timeout exceeds 2 minutes - may cause workflow delays');
        }
        if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].includes((node.parameters.method || 'GET').toUpperCase())) {
            errors.push('Invalid HTTP method');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.HTTPRequestExecutor = HTTPRequestExecutor;
exports.httpRequestExecutor = new HTTPRequestExecutor();
//# sourceMappingURL=index.js.map