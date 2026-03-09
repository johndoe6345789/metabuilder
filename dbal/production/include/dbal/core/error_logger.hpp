/**
 * @file error_logger.hpp
 * @brief Structured error logging utilities
 *
 * Provides consistent error logging with context for debugging
 * and monitoring. Integrates with spdlog for structured logging.
 */

#ifndef DBAL_ERROR_LOGGER_HPP
#define DBAL_ERROR_LOGGER_HPP

#include <string>
#include <map>
#include <spdlog/spdlog.h>
#include "error.hpp"

namespace dbal {

/**
 * @class ErrorLogger
 * @brief Structured error logging with context
 *
 * Provides static methods to log errors with additional context
 * like operation name, entity type, and custom key-value pairs.
 *
 * @example
 * @code
 * try {
 *     // operation
 * } catch (const Error& e) {
 *     ErrorLogger::log(e, "createUser", {{"userId", "123"}});
 * }
 * @endcode
 */
class ErrorLogger {
public:
    using Context = std::map<std::string, std::string>;

    /**
     * @brief Log error with operation context
     * @param error Error instance
     * @param operation Operation name (e.g., "createUser", "executeQuery")
     * @param context Additional key-value context
     */
    static void log(const Error& error, const std::string& operation,
                    const Context& context = {});

    /**
     * @brief Log error with minimal info (error message only)
     * @param error Error instance
     */
    static void log(const Error& error);

    /**
     * @brief Log exception with context
     * @param exception Standard exception
     * @param operation Operation name
     * @param context Additional key-value context
     */
    static void logException(const std::exception& exception,
                              const std::string& operation,
                              const Context& context = {});

    /**
     * @brief Format context as string for logging
     * @param context Key-value context map
     * @return Formatted string (e.g., "userId=123, tenantId=acme")
     */
    static std::string formatContext(const Context& context);

    /**
     * @brief Get spdlog level for error code
     * @param code ErrorCode enum value
     * @return spdlog::level::level_enum (error, warn, critical)
     */
    static spdlog::level::level_enum getLogLevel(ErrorCode code);
};

}

#endif
