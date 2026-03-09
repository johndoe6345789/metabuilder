"use strict";
/**
 * Transform Node Executor Plugin
 * Handles data transformation using template expressions and mappings
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformExecutor = exports.TransformExecutor = void 0;
const workflow_1 = require("@metabuilder/workflow");
class TransformExecutor {
    constructor() {
        this.nodeType = 'transform';
    }
    async execute(node, context, state) {
        const startTime = Date.now();
        try {
            const { mapping, flatten, groupBy, format } = node.parameters;
            if (!mapping || (typeof mapping !== 'object' && typeof mapping !== 'string')) {
                throw new Error('Transform node requires "mapping" parameter (object or template string)');
            }
            // Prepare interpolation context
            const interpolationContext = {
                context,
                state,
                json: context.triggerData,
                env: process.env,
                utils: {
                    flatten: this._flattenObject,
                    groupBy: this._groupByField,
                    merge: this._mergeObjects
                }
            };
            // Apply mapping with template interpolation
            let result = this._applyMapping(mapping, interpolationContext);
            // Apply additional transformations
            if (flatten === true) {
                result = this._flattenObject(result);
            }
            if (groupBy) {
                result = this._groupByField(result, groupBy);
            }
            if (format) {
                result = this._formatResult(result, format);
            }
            const duration = Date.now() - startTime;
            return {
                status: 'success',
                output: result,
                timestamp: Date.now(),
                duration
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                errorCode: 'TRANSFORM_ERROR',
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
        }
    }
    validate(node) {
        const errors = [];
        const warnings = [];
        if (!node.parameters.mapping) {
            errors.push('Mapping is required');
        }
        if (node.parameters.groupBy && typeof node.parameters.groupBy !== 'string') {
            errors.push('GroupBy must be a string (field name)');
        }
        const validFormats = ['json', 'csv', 'xml', 'yaml'];
        if (node.parameters.format && !validFormats.includes(node.parameters.format)) {
            warnings.push(`Format "${node.parameters.format}" may not be fully supported`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Apply mapping transformation with template interpolation
     */
    _applyMapping(mapping, context) {
        if (typeof mapping === 'string') {
            // Direct template interpolation
            return (0, workflow_1.interpolateTemplate)(mapping, context);
        }
        if (Array.isArray(mapping)) {
            return mapping.map((item) => this._applyMapping(item, context));
        }
        if (mapping !== null && typeof mapping === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(mapping)) {
                if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
                    // Template expression
                    result[key] = (0, workflow_1.interpolateTemplate)(value, context);
                }
                else if (typeof value === 'object' && value !== null) {
                    // Recursively apply mapping
                    result[key] = this._applyMapping(value, context);
                }
                else {
                    // Static value
                    result[key] = value;
                }
            }
            return result;
        }
        return mapping;
    }
    /**
     * Flatten nested object structure
     */
    _flattenObject(obj, prefix = '') {
        if (typeof obj !== 'object' || obj === null || obj instanceof Date) {
            return {};
        }
        const result = {};
        const flatten = (current, prop) => {
            if (Array.isArray(current)) {
                current.forEach((item, index) => {
                    flatten(item, `${prop}[${index}]`);
                });
            }
            else if (typeof current === 'object' && current !== null) {
                Object.keys(current).forEach((key) => {
                    flatten(current[key], prop ? `${prop}.${key}` : key);
                });
            }
            else {
                result[prop] = current;
            }
        };
        flatten(obj, prefix);
        return result;
    }
    /**
     * Group array of objects by a field value
     */
    _groupByField(arr, field) {
        if (!Array.isArray(arr)) {
            return {};
        }
        return arr.reduce((grouped, item) => {
            const key = String(item[field] ?? 'null');
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(item);
            return grouped;
        }, {});
    }
    /**
     * Merge multiple objects
     */
    _mergeObjects(...objects) {
        return objects.reduce((merged, obj) => {
            if (typeof obj === 'object' && obj !== null) {
                return { ...merged, ...obj };
            }
            return merged;
        }, {});
    }
    /**
     * Format result based on specified format
     */
    _formatResult(data, format) {
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this._toCSV(data);
            case 'xml':
                return this._toXML(data);
            case 'yaml':
                // Basic YAML representation
                return this._toYAML(data);
            default:
                return data;
        }
    }
    /**
     * Convert data to CSV format
     */
    _toCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        const headers = Object.keys(data[0]);
        const headerRow = headers.map((h) => this._escapeCSVField(h)).join(',');
        const rows = data.map((row) => headers.map((header) => this._escapeCSVField(String(row[header] ?? ''))).join(','));
        return [headerRow, ...rows].join('\n');
    }
    /**
     * Escape CSV field
     */
    _escapeCSVField(field) {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }
    /**
     * Convert data to XML format
     */
    _toXML(data, rootTag = 'root') {
        const xmlContent = this._objectToXML(data);
        return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>${xmlContent}</${rootTag}>`;
    }
    /**
     * Recursively convert object to XML
     */
    _objectToXML(obj) {
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
            return String(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => `<item>${this._objectToXML(item)}</item>`).join('');
        }
        if (typeof obj === 'object' && obj !== null) {
            return Object.entries(obj)
                .map(([key, value]) => `<${key}>${this._objectToXML(value)}</${key}>`)
                .join('');
        }
        return '';
    }
    /**
     * Convert data to YAML format (simplified)
     */
    _toYAML(obj, indent = 0) {
        const indentStr = ' '.repeat(indent);
        if (typeof obj === 'string') {
            return `"${obj}"`;
        }
        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return String(obj);
        }
        if (obj === null) {
            return 'null';
        }
        if (Array.isArray(obj)) {
            return obj
                .map((item) => `${indentStr}- ${this._toYAML(item, indent + 2)}`)
                .join('\n');
        }
        if (typeof obj === 'object') {
            return Object.entries(obj)
                .map(([key, value]) => `${indentStr}${key}: ${this._toYAML(value, indent + 2)}`)
                .join('\n');
        }
        return String(obj);
    }
}
exports.TransformExecutor = TransformExecutor;
exports.transformExecutor = new TransformExecutor();
//# sourceMappingURL=index.js.map