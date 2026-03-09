"use strict";
/**
 * Webhook Response Node Executor Plugin
 * Handles returning HTTP responses to webhook senders
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookResponseExecutor = exports.WebhookResponseExecutor = void 0;
const workflow_1 = require("@metabuilder/workflow");
class WebhookResponseExecutor {
    constructor() {
        this.nodeType = 'webhook-response';
        /**
         * Standard HTTP status texts
         */
        this.statusTexts = {
            200: 'OK',
            201: 'Created',
            202: 'Accepted',
            204: 'No Content',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            409: 'Conflict',
            422: 'Unprocessable Entity',
            429: 'Too Many Requests',
            500: 'Internal Server Error',
            501: 'Not Implemented',
            502: 'Bad Gateway',
            503: 'Service Unavailable'
        };
    }
    async execute(node, context, state) {
        const startTime = Date.now();
        try {
            const { statusCode, body, headers } = node.parameters;
            // Validate status code
            const resolvedStatusCode = this._resolveStatusCode(statusCode);
            // Interpolate template variables in response body
            const resolvedBody = body
                ? (0, workflow_1.interpolateTemplate)(body, { context, state, json: context.triggerData })
                : this._getDefaultBodyForStatus(resolvedStatusCode);
            // Interpolate template variables in headers
            const baseHeaders = headers
                ? (0, workflow_1.interpolateTemplate)(headers, { context, state, json: context.triggerData })
                : {};
            // Determine content type
            const contentType = this._determineContentType(baseHeaders, resolvedBody);
            // Merge with default headers
            const responseHeaders = {
                'Content-Type': contentType,
                'X-Webhook-Delivered': new Date().toISOString(),
                ...baseHeaders
            };
            // Remove any headers that should not be sent
            this._sanitizeHeaders(responseHeaders);
            const response = {
                statusCode: resolvedStatusCode,
                statusText: this.statusTexts[resolvedStatusCode] || 'Unknown',
                headers: responseHeaders,
                body: resolvedBody,
                contentType,
                timestamp: Date.now()
            };
            const duration = Date.now() - startTime;
            return {
                status: 'success',
                output: response,
                timestamp: Date.now(),
                duration,
                isTerminal: true // This node should terminate the workflow
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                errorCode: 'WEBHOOK_RESPONSE_ERROR',
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
        }
    }
    validate(node) {
        const errors = [];
        const warnings = [];
        // Validate status code if provided
        if (node.parameters.statusCode !== undefined) {
            const statusCode = node.parameters.statusCode;
            if (typeof statusCode !== 'number' && typeof statusCode !== 'string') {
                errors.push('Status code must be a number or numeric string');
            }
            else {
                const code = typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;
                if (isNaN(code) || code < 100 || code > 599) {
                    errors.push('Status code must be between 100 and 599');
                }
            }
        }
        // Validate headers if provided
        if (node.parameters.headers && typeof node.parameters.headers !== 'object') {
            errors.push('Headers must be an object');
        }
        // Validate body if provided
        if (node.parameters.body !== undefined) {
            if (typeof node.parameters.body !== 'object' && typeof node.parameters.body !== 'string') {
                errors.push('Body must be an object or string');
            }
        }
        // Warn about common issues
        if (!node.parameters.statusCode) {
            warnings.push('No status code specified - will default to 200 OK');
        }
        if (node.parameters.statusCode && [500, 501, 502, 503].includes(node.parameters.statusCode)) {
            warnings.push('Using 5xx status code - ensure this is intentional');
        }
        // Check for unsafe headers
        const unsafeHeaders = [
            'Content-Length',
            'Transfer-Encoding',
            'Connection',
            'Keep-Alive',
            'Proxy-Authenticate',
            'WWW-Authenticate'
        ];
        if (node.parameters.headers) {
            const headerKeys = Object.keys(node.parameters.headers);
            const foundUnsafe = headerKeys.filter((k) => unsafeHeaders.some((u) => u.toLowerCase() === k.toLowerCase()));
            if (foundUnsafe.length > 0) {
                warnings.push(`Headers contain restricted keys: ${foundUnsafe.join(', ')}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Resolve status code from parameter (number, string, or template)
     */
    _resolveStatusCode(statusCode) {
        if (statusCode === undefined || statusCode === null) {
            return 200;
        }
        if (typeof statusCode === 'number') {
            return statusCode;
        }
        if (typeof statusCode === 'string') {
            const parsed = parseInt(statusCode, 10);
            return isNaN(parsed) ? 200 : parsed;
        }
        return 200;
    }
    /**
     * Get default response body based on status code
     */
    _getDefaultBodyForStatus(statusCode) {
        const statusText = this.statusTexts[statusCode] || 'Unknown Status';
        if (statusCode >= 200 && statusCode < 300) {
            return {
                success: true,
                status: statusCode,
                message: statusText
            };
        }
        if (statusCode >= 400 && statusCode < 500) {
            return {
                success: false,
                error: statusText,
                status: statusCode
            };
        }
        if (statusCode >= 500) {
            return {
                success: false,
                error: 'Server Error',
                status: statusCode,
                message: statusText
            };
        }
        return { status: statusCode };
    }
    /**
     * Determine content type from headers or body
     */
    _determineContentType(headers, body) {
        // Check if Content-Type is already specified
        const existingContentType = Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')?.[1];
        if (existingContentType) {
            return existingContentType;
        }
        // Determine based on body type
        if (typeof body === 'string') {
            // Check if it looks like JSON
            if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
                return 'application/json';
            }
            // Check if it looks like XML
            if (body.trim().startsWith('<')) {
                return 'application/xml';
            }
            // Check if it looks like CSV
            if (body.includes('\n') && body.includes(',')) {
                return 'text/csv';
            }
            return 'text/plain';
        }
        // Default to JSON for objects
        return 'application/json';
    }
    /**
     * Remove or normalize restricted headers
     */
    _sanitizeHeaders(headers) {
        const restrictedHeaders = [
            'content-length',
            'transfer-encoding',
            'connection',
            'keep-alive',
            'proxy-authenticate',
            'www-authenticate'
        ];
        for (const header of restrictedHeaders) {
            const key = Object.keys(headers).find((k) => k.toLowerCase() === header);
            if (key) {
                delete headers[key];
            }
        }
    }
}
exports.WebhookResponseExecutor = WebhookResponseExecutor;
exports.webhookResponseExecutor = new WebhookResponseExecutor();
//# sourceMappingURL=index.js.map