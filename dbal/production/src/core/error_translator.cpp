#include "dbal/core/error_translator.hpp"
#include <sqlite3.h>

namespace dbal {

std::string ErrorTranslator::appendContext(const std::string& message,
                                             const std::string& context) {
    if (context.empty()) {
        return message;
    }
    return context + ": " + message;
}

Error ErrorTranslator::fromSQLite(int sqliteErrorCode, const std::string& message,
                                    const std::string& context) {
    std::string fullMessage = appendContext(message, context);

    switch (sqliteErrorCode) {
        case SQLITE_CONSTRAINT:
        case SQLITE_CONSTRAINT_UNIQUE:
        case SQLITE_CONSTRAINT_PRIMARYKEY:
            return Error::conflict(fullMessage);

        case SQLITE_NOTFOUND:
            return Error::notFound(fullMessage);

        case SQLITE_LOCKED:
        case SQLITE_BUSY:
            return Error(ErrorCode::DatabaseError, "Database is locked: " + fullMessage);

        case SQLITE_READONLY:
            return Error::forbidden("Database is read-only: " + fullMessage);

        case SQLITE_CANTOPEN:
            return Error(ErrorCode::DatabaseError, "Cannot open database: " + fullMessage);

        case SQLITE_NOMEM:
            return Error::internal("Out of memory: " + fullMessage);

        case SQLITE_CORRUPT:
        case SQLITE_NOTADB:
            return Error(ErrorCode::DatabaseError, "Database corrupted: " + fullMessage);

        default:
            return Error::internal(fullMessage);
    }
}

Error ErrorTranslator::fromPostgres(const std::string& pgErrorCode,
                                      const std::string& message,
                                      const std::string& context) {
    std::string fullMessage = appendContext(message, context);

    // PostgreSQL SQLSTATE codes (first 2 chars indicate error class)
    if (pgErrorCode.substr(0, 2) == "23") {
        // Integrity constraint violation
        if (pgErrorCode == "23505") {
            return Error::conflict(fullMessage);  // Unique violation
        }
        if (pgErrorCode == "23503") {
            return Error::conflict(fullMessage);  // Foreign key violation
        }
        return Error::validationError(fullMessage);
    }

    if (pgErrorCode.substr(0, 2) == "42") {
        // Syntax error or access rule violation
        if (pgErrorCode == "42501") {
            return Error::forbidden(fullMessage);  // Insufficient privilege
        }
        return Error::validationError(fullMessage);
    }

    if (pgErrorCode.substr(0, 2) == "08") {
        // Connection exception
        return Error(ErrorCode::DatabaseError, fullMessage);
    }

    if (pgErrorCode.substr(0, 2) == "57") {
        // Operator intervention (timeout, etc.)
        return Error(ErrorCode::Timeout, fullMessage);
    }

    return Error::internal(fullMessage);
}

Error ErrorTranslator::fromMySQL(int mysqlErrorCode, const std::string& message,
                                   const std::string& context) {
    std::string fullMessage = appendContext(message, context);

    switch (mysqlErrorCode) {
        case 1062:  // ER_DUP_ENTRY
        case 1586:  // ER_DUP_ENTRY_WITH_KEY_NAME
            return Error::conflict(fullMessage);

        case 1146:  // ER_NO_SUCH_TABLE
        case 1054:  // ER_BAD_FIELD_ERROR
            return Error::notFound(fullMessage);

        case 1045:  // ER_ACCESS_DENIED_ERROR
        case 1142:  // ER_TABLEACCESS_DENIED_ERROR
            return Error::forbidden(fullMessage);

        case 1213:  // ER_LOCK_DEADLOCK
        case 1205:  // ER_LOCK_WAIT_TIMEOUT
            return Error(ErrorCode::Timeout, fullMessage);

        case 2002:  // CR_CONNECTION_ERROR
        case 2003:  // CR_CONN_HOST_ERROR
        case 2006:  // CR_SERVER_GONE_ERROR
        case 2013:  // CR_SERVER_LOST
            return Error(ErrorCode::DatabaseError, fullMessage);

        default:
            return Error::internal(fullMessage);
    }
}

Error ErrorTranslator::fromMongoDB(int mongoErrorCode, const std::string& message,
                                     const std::string& context) {
    std::string fullMessage = appendContext(message, context);

    switch (mongoErrorCode) {
        case 11000:  // DuplicateKey
        case 11001:  // DuplicateKeyOnUpdate
            return Error::conflict(fullMessage);

        case 26:     // NamespaceNotFound
            return Error::notFound(fullMessage);

        case 13:     // Unauthorized
            return Error::unauthorized(fullMessage);

        case 18:     // AuthenticationFailed
            return Error::unauthorized(fullMessage);

        case 50:     // ExceededTimeLimit
            return Error(ErrorCode::Timeout, fullMessage);

        case 6:      // HostUnreachable
        case 89:     // NetworkTimeout
            return Error(ErrorCode::DatabaseError, fullMessage);

        default:
            return Error::internal(fullMessage);
    }
}

Error ErrorTranslator::fromRuntimeError(const std::runtime_error& exception,
                                         const std::string& context) {
    std::string fullMessage = appendContext(exception.what(), context);
    return Error::internal(fullMessage);
}

Error ErrorTranslator::fromHttpStatus(int httpStatus, const std::string& message) {
    switch (httpStatus) {
        case 400:
            return Error::validationError(message);
        case 401:
            return Error::unauthorized(message);
        case 403:
            return Error::forbidden(message);
        case 404:
            return Error::notFound(message);
        case 409:
            return Error::conflict(message);
        case 422:
            return Error::validationError(message);
        case 429:
            return Error(ErrorCode::RateLimitExceeded, message);
        case 500:
            return Error::internal(message);
        case 501:
            return Error(ErrorCode::CapabilityNotSupported, message);
        case 503:
            return Error(ErrorCode::DatabaseError, message);
        case 504:
            return Error(ErrorCode::Timeout, message);
        default:
            return Error::internal(message);
    }
}

}
