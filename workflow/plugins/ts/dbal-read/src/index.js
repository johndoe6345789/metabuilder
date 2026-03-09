"use strict";
/**
 * DBAL Read Node Executor Plugin
 * Fetches data from the C++ DBAL REST API via fetch().
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbalReadExecutor = exports.DBALReadExecutor = void 0;
const workflow_1 = require("@metabuilder/workflow");
const DBAL_API_URL = process.env.DBAL_API_URL ?? 'http://localhost:8080';
class DBALReadExecutor {
    constructor() {
        this.nodeType = 'dbal-read';
    }
    async execute(node, context, state) {
        const startTime = Date.now();
        try {
            const { entity, operation, filter, sort, limit, offset, packageId } = node.parameters;
            if (!entity) {
                throw new Error('DBAL read node requires "entity" parameter');
            }
            const resolvedFilter = filter
                ? (0, workflow_1.interpolateTemplate)(filter, { context, state, json: context.triggerData })
                : {};
            if (context.tenantId && !resolvedFilter.tenantId) {
                resolvedFilter.tenantId = context.tenantId;
            }
            const pkg = packageId ?? 'default';
            const tenant = context.tenantId ?? 'default';
            let result;
            switch (operation || 'read') {
                case 'read': {
                    const params = new URLSearchParams();
                    if (Object.keys(resolvedFilter).length > 0) {
                        params.set('filter', JSON.stringify(resolvedFilter));
                    }
                    if (sort)
                        params.set('sort', JSON.stringify(sort));
                    params.set('limit', String(limit ?? 100));
                    params.set('offset', String(offset ?? 0));
                    const url = `${DBAL_API_URL}/api/v1/${tenant}/${pkg}/${entity}?${params}`;
                    const response = await fetch(url, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!response.ok) {
                        throw new Error(`DBAL read failed: ${response.status} ${response.statusText}`);
                    }
                    result = await response.json();
                    break;
                }
                case 'count': {
                    const params = new URLSearchParams();
                    if (Object.keys(resolvedFilter).length > 0) {
                        params.set('filter', JSON.stringify(resolvedFilter));
                    }
                    params.set('count', 'true');
                    const url = `${DBAL_API_URL}/api/v1/${tenant}/${pkg}/${entity}?${params}`;
                    const response = await fetch(url, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!response.ok) {
                        throw new Error(`DBAL count failed: ${response.status} ${response.statusText}`);
                    }
                    result = await response.json();
                    break;
                }
                case 'get': {
                    const id = node.parameters.id;
                    if (!id)
                        throw new Error('Get operation requires "id" parameter');
                    const url = `${DBAL_API_URL}/api/v1/${tenant}/${pkg}/${entity}/${id}`;
                    const response = await fetch(url, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!response.ok) {
                        throw new Error(`DBAL get failed: ${response.status} ${response.statusText}`);
                    }
                    result = await response.json();
                    break;
                }
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }
            return {
                status: 'success',
                output: result,
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                errorCode: 'DBAL_READ_ERROR',
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
        }
    }
    validate(node) {
        const errors = [];
        const warnings = [];
        if (!node.parameters.entity) {
            errors.push('Entity is required');
        }
        if (node.parameters.operation === 'get' && !node.parameters.id) {
            errors.push('Get operation requires id parameter');
        }
        if (node.parameters.limit && node.parameters.limit > 10000) {
            warnings.push('Limit exceeds 10000 - may cause performance issues');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.DBALReadExecutor = DBALReadExecutor;
exports.dbalReadExecutor = new DBALReadExecutor();
//# sourceMappingURL=index.js.map