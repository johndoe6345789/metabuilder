/**
 * Low-level SQL parameter type validators.
 * Called by featureValidators.ts.
 */

import type { SqlParameterType } from './featureTypes';

type ValidateResult = {
  valid: boolean;
  sanitized?: any;
  error?: string;
};

export function validateIdentifier(
  strValue: string,
  paramType: SqlParameterType,
): ValidateResult {
  if (!paramType.validation) {
    return {
      valid: false,
      error: 'No validation pattern defined for identifier',
    };
  }
  if (!new RegExp(paramType.validation).test(strValue)) {
    return {
      valid: false,
      error:
        `Invalid identifier format: ${strValue}. `
        + `Must match ${paramType.validation}`,
    };
  }
  return { valid: true, sanitized: strValue };
}

export function validateEnum(
  strValue: string,
  paramType: SqlParameterType,
): ValidateResult {
  if (!paramType.allowedValues) {
    return { valid: false, error: 'No allowed values defined for enum' };
  }
  if (!paramType.allowedValues.includes(strValue)) {
    return {
      valid: false,
      error:
        `Invalid enum value: ${strValue}. `
        + `Allowed: ${paramType.allowedValues.join(', ')}`,
    };
  }
  return { valid: true, sanitized: strValue };
}

export function validateInteger(
  value: any,
  paramType: SqlParameterType,
): ValidateResult {
  const num = Number(value);
  if (!Number.isInteger(num)) {
    return { valid: false, error: `Not an integer: ${value}` };
  }
  if (paramType.min !== undefined && num < paramType.min) {
    return {
      valid: false,
      error: `Value ${num} is less than minimum ${paramType.min}`,
    };
  }
  if (paramType.max !== undefined && num > paramType.max) {
    return {
      valid: false,
      error: `Value ${num} exceeds maximum ${paramType.max}`,
    };
  }
  return { valid: true, sanitized: num };
}

export function validateStringParam(
  strValue: string,
  paramType: SqlParameterType,
): ValidateResult {
  if (paramType.validation) {
    if (!new RegExp(paramType.validation).test(strValue)) {
      return {
        valid: false,
        error:
          `Invalid string format: ${strValue}. `
          + `Must match ${paramType.validation}`,
      };
    }
  }
  return { valid: true, sanitized: strValue };
}
