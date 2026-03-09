/**
 * @file error_translator.hpp
 * @brief Backend error to DBAL error translation utilities
 *
 * Provides utilities to translate backend-specific errors (SQLite,
 * PostgreSQL, MongoDB, etc.) into standardized DBAL Error instances.
 */

#ifndef DBAL_ERROR_TRANSLATOR_HPP
#define DBAL_ERROR_TRANSLATOR_HPP

#include <string>
#include "error.hpp"

namespace dbal {

/**
 * @class ErrorTranslator
 * @brief Translate backend errors to DBAL errors
 *
 * Provides static methods to convert backend-specific error messages
 * and codes into standardized DBAL Error instances for consistent
 * error handling across all database adapters.
 *
 * @example
 * @code
 * // SQLite error translation
 * int sqliteCode = sqlite3_errcode(db);
 * std::string sqliteMsg = sqlite3_errmsg(db);
 * throw ErrorTranslator::fromSQLite(sqliteCode, sqliteMsg);
 *
 * // PostgreSQL error translation
 * throw ErrorTranslator::fromPostgres(pgResult);
 * @endcode
 */
class ErrorTranslator {
public:
    /**
     * @brief Translate SQLite error to DBAL error
     * @param sqliteErrorCode SQLite error code (e.g., SQLITE_CONSTRAINT)
     * @param message SQLite error message
     * @param context Additional context (e.g., entity name, operation)
     * @return DBAL Error instance
     */
    static Error fromSQLite(int sqliteErrorCode, const std::string& message,
                             const std::string& context = "");

    /**
     * @brief Translate PostgreSQL error to DBAL error
     * @param pgErrorCode PostgreSQL SQLSTATE code (e.g., "23505")
     * @param message PostgreSQL error message
     * @param context Additional context
     * @return DBAL Error instance
     */
    static Error fromPostgres(const std::string& pgErrorCode,
                               const std::string& message,
                               const std::string& context = "");

    /**
     * @brief Translate MySQL error to DBAL error
     * @param mysqlErrorCode MySQL error number
     * @param message MySQL error message
     * @param context Additional context
     * @return DBAL Error instance
     */
    static Error fromMySQL(int mysqlErrorCode, const std::string& message,
                            const std::string& context = "");

    /**
     * @brief Translate MongoDB error to DBAL error
     * @param mongoErrorCode MongoDB error code
     * @param message MongoDB error message
     * @param context Additional context
     * @return DBAL Error instance
     */
    static Error fromMongoDB(int mongoErrorCode, const std::string& message,
                              const std::string& context = "");

    /**
     * @brief Translate generic std::runtime_error to DBAL error
     * @param exception Runtime error
     * @param context Additional context
     * @return DBAL Error instance (defaults to InternalError)
     */
    static Error fromRuntimeError(const std::runtime_error& exception,
                                    const std::string& context = "");

    /**
     * @brief Translate HTTP status code to DBAL error
     * @param httpStatus HTTP status code (e.g., 404, 500)
     * @param message Custom error message
     * @return DBAL Error instance
     */
    static Error fromHttpStatus(int httpStatus, const std::string& message);

private:
    /**
     * @brief Helper to append context to message
     * @param message Base error message
     * @param context Additional context
     * @return Combined message
     */
    static std::string appendContext(const std::string& message,
                                       const std::string& context);
};

}

#endif
