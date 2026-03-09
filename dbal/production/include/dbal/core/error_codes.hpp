/**
 * @file error_codes.hpp
 * @brief HTTP-aligned error code definitions for DBAL
 *
 * Defines ErrorCode enum that maps to HTTP status codes for
 * consistent error handling across REST APIs and services.
 */

#ifndef DBAL_ERROR_CODES_HPP
#define DBAL_ERROR_CODES_HPP

namespace dbal {

/**
 * @enum ErrorCode
 * @brief HTTP-aligned error codes for consistent error handling
 *
 * Error codes map to HTTP status codes for easy integration with
 * REST APIs and web services. Each code represents a specific
 * failure category with well-defined semantics.
 */
enum class ErrorCode {
    NotFound = 404,                  ///< Resource not found
    Conflict = 409,                  ///< Resource conflict (e.g., duplicate key)
    Unauthorized = 401,              ///< Authentication required
    Forbidden = 403,                 ///< Access forbidden (insufficient permissions)
    ValidationError = 422,           ///< Input validation failed
    RateLimitExceeded = 429,         ///< Too many requests (quota exceeded)
    InternalError = 500,             ///< Internal server error
    Timeout = 504,                   ///< Operation timed out
    DatabaseError = 503,             ///< Database unavailable
    CapabilityNotSupported = 501,    ///< Feature not supported
    SandboxViolation = 406,          ///< Sandbox security violation (Not Acceptable)
    MaliciousCodeDetected = 451      ///< Malicious code detected (Unavailable For Legal Reasons)
};

}

#endif
