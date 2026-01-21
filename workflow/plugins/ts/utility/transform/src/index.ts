/**
 * Transform Node Executor Plugin
 * Handles data transformation using template expressions and mappings
 *
 * @packageDocumentation
 */

import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState,
  NodeResult,
  ValidationResult
} from '@metabuilder/workflow';
import { interpolateTemplate } from '@metabuilder/workflow';

export class TransformExecutor implements INodeExecutor {
  nodeType = 'transform';

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
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
      let result: any = this._applyMapping(mapping, interpolationContext);

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
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'TRANSFORM_ERROR',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

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
  private _applyMapping(mapping: any, context: any): any {
    if (typeof mapping === 'string') {
      // Direct template interpolation
      return interpolateTemplate(mapping, context);
    }

    if (Array.isArray(mapping)) {
      return mapping.map((item) => this._applyMapping(item, context));
    }

    if (mapping !== null && typeof mapping === 'object') {
      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(mapping)) {
        if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
          // Template expression
          result[key] = interpolateTemplate(value, context);
        } else if (typeof value === 'object' && value !== null) {
          // Recursively apply mapping
          result[key] = this._applyMapping(value, context);
        } else {
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
  private _flattenObject(obj: any, prefix = ''): Record<string, any> {
    if (typeof obj !== 'object' || obj === null || obj instanceof Date) {
      return {};
    }

    const result: Record<string, any> = {};

    const flatten = (current: any, prop: string) => {
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          flatten(item, `${prop}[${index}]`);
        });
      } else if (typeof current === 'object' && current !== null) {
        Object.keys(current).forEach((key) => {
          flatten(current[key], prop ? `${prop}.${key}` : key);
        });
      } else {
        result[prop] = current;
      }
    };

    flatten(obj, prefix);
    return result;
  }

  /**
   * Group array of objects by a field value
   */
  private _groupByField(arr: any[], field: string): Record<string, any[]> {
    if (!Array.isArray(arr)) {
      return {};
    }

    return arr.reduce(
      (grouped: Record<string, any[]>, item) => {
        const key = String(item[field] ?? 'null');
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
        return grouped;
      },
      {}
    );
  }

  /**
   * Merge multiple objects
   */
  private _mergeObjects(...objects: any[]): Record<string, any> {
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
  private _formatResult(data: any, format: string): any {
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
  private _toCSV(data: any): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const headerRow = headers.map((h) => this._escapeCSVField(h)).join(',');

    const rows = data.map((row: any) =>
      headers.map((header) => this._escapeCSVField(String(row[header] ?? ''))).join(',')
    );

    return [headerRow, ...rows].join('\n');
  }

  /**
   * Escape CSV field
   */
  private _escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Convert data to XML format
   */
  private _toXML(data: any, rootTag = 'root'): string {
    const xmlContent = this._objectToXML(data);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>${xmlContent}</${rootTag}>`;
  }

  /**
   * Recursively convert object to XML
   */
  private _objectToXML(obj: any): string {
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => `<item>${this._objectToXML(item)}</item>`).join('');
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(
          ([key, value]) =>
            `<${key}>${this._objectToXML(value)}</${key}>`
        )
        .join('');
    }

    return '';
  }

  /**
   * Convert data to YAML format (simplified)
   */
  private _toYAML(obj: any, indent = 0): string {
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
        .map(
          ([key, value]) =>
            `${indentStr}${key}: ${this._toYAML(value, indent + 2)}`
        )
        .join('\n');
    }

    return String(obj);
  }
}

export const transformExecutor = new TransformExecutor();
