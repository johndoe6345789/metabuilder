/**
 * @file error.hpp
 * @brief Core Error exception class with typed error codes
 *
 * Provides structured error handling with HTTP-aligned status codes
 * and factory methods for common error scenarios.
 */

#ifndef DBAL_ERROR_HPP
#define DBAL_ERROR_HPP

#include <stdexcept>
#include <string>
#include "error_codes.hpp"

namespace dbal {

/**
 * @class Error
 * @brief Exception class with typed error codes
 *
 * Provides structured error handling with HTTP-aligned status codes
 * and factory methods for common error scenarios. Derives from
 * std::runtime_error for compatibility with standard exception handling.
 *
 * @example
 * @code
 * // Throw specific error
 * throw Error::notFound("User not found");
 *
 * // Check error code
 * try {
 *     // operation
 * } catch (const Error& e) {
 *     if (e.code() == ErrorCode::NotFound) {
 *         // handle not found
 *     }
 * }
 * @endcode
 */
class Error : public std::runtime_error {
public:
    /**
     * @brief Construct error with code and message
     * @param code HTTP-aligned error code
     * @param message Human-readable error message
     */
    Error(ErrorCode code, const std::string& message)
        : std::runtime_error(message), code_(code) {}

    /**
     * @brief Get the error code
     * @return ErrorCode indicating error type
     */
    ErrorCode code() const { return code_; }

    /**
     * @brief Factory for NotFound errors (404)
     * @param message Optional custom message
     * @return Error instance
     */
    static Error notFound(const std::string& message = "Resource not found");

    /**
     * @brief Factory for Conflict errors (409)
     * @param message Optional custom message
     * @return Error instance
     */
    static Error conflict(const std::string& message = "Resource conflict");

    /**
     * @brief Factory for Unauthorized errors (401)
     * @param message Optional custom message
     * @return Error instance
     */
    static Error unauthorized(const std::string& message = "Authentication required");

    /**
     * @brief Factory for Forbidden errors (403)
     * @param message Optional custom message
     * @return Error instance
     */
    static Error forbidden(const std::string& message = "Access forbidden");

    /**
     * @brief Factory for ValidationError (422)
     * @param message Validation failure details
     * @return Error instance
     */
    static Error validationError(const std::string& message);

    /**
     * @brief Factory for InternalError (500)
     * @param message Optional custom message
     * @return Error instance
     */
    static Error internal(const std::string& message = "Internal server error");

    /**
     * @brief Factory for SandboxViolation errors
     * @param message Violation details
     * @return Error instance
     */
    static Error sandboxViolation(const std::string& message);

    /**
     * @brief Factory for MaliciousCodeDetected errors
     * @param message Detection details
     * @return Error instance
     */
    static Error maliciousCode(const std::string& message);

private:
    ErrorCode code_;  ///< Error code
};

}

#endif
