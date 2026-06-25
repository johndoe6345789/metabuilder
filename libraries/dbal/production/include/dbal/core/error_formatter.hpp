/**
 * @file error_formatter.hpp
 * @brief Error formatting utilities for HTTP/JSON responses
 *
 * Provides utilities to format DBAL errors into HTTP responses
 * and JSON payloads for consistent API error responses.
 */

#ifndef DBAL_ERROR_FORMATTER_HPP
#define DBAL_ERROR_FORMATTER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "error.hpp"

namespace dbal {

/**
 * @class ErrorFormatter
 * @brief Format errors for HTTP/JSON responses
 *
 * Provides static methods to convert Error instances into
 * HTTP status codes and JSON payloads for REST API responses.
 *
 * @example
 * @code
 * try {
 *     // operation
 * } catch (const Error& e) {
 *     int status = ErrorFormatter::toHttpStatus(e);
 *     auto json = ErrorFormatter::toJson(e);
 *     return Response{status, json};
 * }
 * @endcode
 */
class ErrorFormatter {
public:
    /**
     * @brief Convert Error to HTTP status code
     * @param error Error instance
     * @return HTTP status code (e.g., 404, 500)
     */
    static int toHttpStatus(const Error& error);

    /**
     * @brief Convert ErrorCode to HTTP status code
     * @param code ErrorCode enum value
     * @return HTTP status code (e.g., 404, 500)
     */
    static int toHttpStatus(ErrorCode code);

    /**
     * @brief Format Error as JSON payload
     * @param error Error instance
     * @param includeDetails Include detailed error message (default: true)
     * @return JSON object with error details
     *
     * Example output:
     * {
     *   "error": {
     *     "code": 404,
     *     "type": "NotFound",
     *     "message": "User not found"
     *   }
     * }
     */
    static nlohmann::json toJson(const Error& error, bool includeDetails = true);

    /**
     * @brief Format Error as JSON string
     * @param error Error instance
     * @param pretty Pretty-print JSON (default: false)
     * @param includeDetails Include detailed error message (default: true)
     * @return JSON string
     */
    static std::string toJsonString(const Error& error, bool pretty = false,
                                     bool includeDetails = true);

    /**
     * @brief Get human-readable error type name
     * @param code ErrorCode enum value
     * @return Error type string (e.g., "NotFound", "ValidationError")
     */
    static std::string getErrorTypeName(ErrorCode code);
};

}

#endif
