/**
 * SQL parameter and template validation using features.json config.
 */

import {
  getSqlParameterType,
  getSqlQueryTemplate,
} from './featureAccessors';
import {
  validateEnum,
  validateIdentifier,
  validateInteger,
  validateStringParam,
} from './sqlParamValidator';

type ValidateResult = {
  valid: boolean;
  sanitized?: any;
  error?: string;
};

type ValidateTemplateResult = {
  valid: boolean;
  sanitized?: Record<string, any>;
  errors?: string[];
};

export function validateSqlParameter(
  paramName: string,
  value: any,
): ValidateResult {
  const paramType = getSqlParameterType(paramName);
  if (!paramType) {
    return {
      valid: false,
      error: `Unknown parameter type: ${paramName}`,
    };
  }
  const strValue = String(value);
  switch (paramType.type) {
    case 'identifier': return validateIdentifier(strValue, paramType);
    case 'enum': return validateEnum(strValue, paramType);
    case 'integer': return validateInteger(value, paramType);
    case 'string': return validateStringParam(strValue, paramType);
    default:
      return {
        valid: false,
        error: `Unknown parameter type: ${paramType.type}`,
      };
  }
}

export function validateSqlTemplateParams(
  category: string,
  templateName: string,
  params: Record<string, any>,
): ValidateTemplateResult {
  const template = getSqlQueryTemplate(category, templateName);
  if (!template) {
    return {
      valid: false,
      errors: [`Template not found: ${category}.${templateName}`],
    };
  }
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};
  for (const [paramKey, paramTypeName] of Object.entries(
    template.parameters,
  )) {
    const value = params[paramKey];
    if (value === undefined || value === null) {
      const paramType = getSqlParameterType(paramTypeName);
      if (paramType?.default !== undefined) {
        sanitized[paramKey] = paramType.default;
        continue;
      }
      errors.push(`Missing required parameter: ${paramKey}`);
      continue;
    }
    const v = validateSqlParameter(paramTypeName, value);
    if (!v.valid) {
      errors.push(`Parameter ${paramKey}: ${v.error}`);
    } else {
      sanitized[paramKey] = v.sanitized;
    }
  }
  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, sanitized };
}
