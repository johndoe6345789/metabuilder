/**
 * @file errors.hpp
 * @brief Error handling types and utilities for DBAL
 *
 * Provides comprehensive error handling with typed error codes,
 * factory methods, and Result<T> monad for functional error handling.
 */

#ifndef DBAL_ERRORS_HPP
#define DBAL_ERRORS_HPP

#include <stdexcept>
#include <string>
#include <optional>

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
    SandboxViolation = 403,          ///< Sandbox security violation
    MaliciousCodeDetected = 403      ///< Malicious code detected
};

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

/**
 * @class Result
 * @brief Functional error handling monad (Railway-Oriented Programming)
 *
 * Result<T> represents either a successful value (Ok) or an error (Err).
 * This enables explicit error handling without exceptions for performance-
 * critical code paths.
 *
 * @tparam T The success value type
 *
 * @example
 * @code
 * Result<User> getUser(int id) {
 *     if (user_exists(id)) {
 *         return User{id, "John"};  // Ok
 *     }
 *     return Error::notFound("User not found");  // Err
 * }
 *
 * auto result = getUser(123);
 * if (result.isOk()) {
 *     std::cout << result.value().name;
 * } else {
 *     std::cerr << result.error().what();
 * }
 * @endcode
 */
template<typename T>
class Result {
public:
    /**
     * @brief Construct successful result with value
     * @param value Success value
     */
    Result(T value) : value_(std::move(value)), has_value_(true) {}

    /**
     * @brief Construct error result
     * @param error Error instance
     */
    Result(Error error) : error_(std::move(error)), has_value_(false) {}

    /**
     * @brief Check if result contains value
     * @return true if Ok, false if Err
     */
    bool isOk() const { return has_value_; }

    /**
     * @brief Check if result contains error
     * @return true if Err, false if Ok
     */
    bool isError() const { return !has_value_; }

    /**
     * @brief Get mutable reference to value
     * @return Value reference
     * @throws Error if result is Err
     */
    T& value() {
        if (!has_value_) throw error_;
        return value_;
    }

    /**
     * @brief Get const reference to value
     * @return Value reference
     * @throws Error if result is Err
     */
    const T& value() const {
        if (!has_value_) throw error_;
        return value_;
    }

    /**
     * @brief Get mutable reference to error
     * @return Error reference
     * @throws std::logic_error if result is Ok
     */
    Error& error() {
        if (has_value_) throw std::logic_error("No error present");
        return error_;
    }

    /**
     * @brief Get const reference to error
     * @return Error reference
     * @throws std::logic_error if result is Ok
     */
    const Error& error() const {
        if (has_value_) throw std::logic_error("No error present");
        return error_;
    }

private:
    T value_;          ///< Success value (if has_value_ == true)
    Error error_{ErrorCode::InternalError, ""};  ///< Error (if has_value_ == false)
    bool has_value_;   ///< true if Ok, false if Err
};

}

#endif
