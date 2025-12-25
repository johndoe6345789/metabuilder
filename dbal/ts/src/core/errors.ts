export enum DBALErrorCode {
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  VALIDATION_ERROR = 422,
  RATE_LIMIT_EXCEEDED = 429,
  INTERNAL_ERROR = 500,
  TIMEOUT = 504,
  DATABASE_ERROR = 503,
  CAPABILITY_NOT_SUPPORTED = 501,
  SANDBOX_VIOLATION = 4031,
  MALICIOUS_CODE_DETECTED = 4032,
  QUOTA_EXCEEDED = 507,
  PERMISSION_DENIED = 4033,
}

export class DBALError extends Error {
  constructor(
    public code: DBALErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DBALError'
  }

  static notFound(message = 'Resource not found'): DBALError {
    return new DBALError(DBALErrorCode.NOT_FOUND, message)
  }

  static conflict(message = 'Resource conflict'): DBALError {
    return new DBALError(DBALErrorCode.CONFLICT, message)
  }

  static unauthorized(message = 'Authentication required'): DBALError {
    return new DBALError(DBALErrorCode.UNAUTHORIZED, message)
  }

  static forbidden(message = 'Access forbidden'): DBALError {
    return new DBALError(DBALErrorCode.FORBIDDEN, message)
  }

  static validationError(message: string, fields?: Array<{field: string, error: string}>): DBALError {
    return new DBALError(DBALErrorCode.VALIDATION_ERROR, message, { fields })
  }

  static rateLimitExceeded(retryAfter?: number): DBALError {
    return new DBALError(
      DBALErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      { retryAfter }
    )
  }

  static internal(message = 'Internal server error'): DBALError {
    return new DBALError(DBALErrorCode.INTERNAL_ERROR, message)
  }

  static timeout(message = 'Operation timeout'): DBALError {
    return new DBALError(DBALErrorCode.TIMEOUT, message)
  }

  static databaseError(message = 'Database unavailable'): DBALError {
    return new DBALError(DBALErrorCode.DATABASE_ERROR, message)
  }

  static capabilityNotSupported(feature: string): DBALError {
    return new DBALError(
      DBALErrorCode.CAPABILITY_NOT_SUPPORTED,
      `Feature not supported: ${feature}`
    )
  }

  static sandboxViolation(message: string): DBALError {
    return new DBALError(DBALErrorCode.SANDBOX_VIOLATION, message)
  }

  static maliciousCode(message: string): DBALError {
    return new DBALError(DBALErrorCode.MALICIOUS_CODE_DETECTED, message)
  }

  static quotaExceeded(message = 'Storage quota exceeded'): DBALError {
    return new DBALError(DBALErrorCode.QUOTA_EXCEEDED, message)
  }

  static permissionDenied(message = 'Permission denied'): DBALError {
    return new DBALError(DBALErrorCode.PERMISSION_DENIED, message)
  }
}
