#include "sqlite_prepared_statements.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace sqlite {

SQLitePreparedStatements::SQLitePreparedStatements(SQLiteConnectionManager& conn_manager)
    : conn_manager_(conn_manager) {
}

Result<sqlite3_stmt*> SQLitePreparedStatements::prepare(const std::string& sql) {
    std::lock_guard<std::mutex> lock(conn_manager_.getMutex());
    return prepareLocked(sql);
}

Result<sqlite3_stmt*> SQLitePreparedStatements::prepareLocked(const std::string& sql) {
    sqlite3* db = conn_manager_.getHandle();
    if (!db) {
        return Error::internal("Database connection not open");
    }

    sqlite3_stmt* stmt = nullptr;
    const int rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);

    if (rc != SQLITE_OK) {
        return mapSqliteError(rc, "Failed to prepare statement");
    }

    return Result<sqlite3_stmt*>(stmt);
}

// Must match kSqlNullSentinel in sqlite_type_converter.cpp
static const std::string kSqlNullSentinel = "\x01NULL\x01";

Result<bool> SQLitePreparedStatements::bindParameters(sqlite3_stmt* stmt,
                                                       const std::vector<std::string>& values) {
    for (size_t i = 0; i < values.size(); ++i) {
        int rc;
        if (values[i] == kSqlNullSentinel) {
            rc = sqlite3_bind_null(stmt, static_cast<int>(i + 1));
        } else {
            rc = sqlite3_bind_text(stmt, static_cast<int>(i + 1),
                                   values[i].c_str(), -1, SQLITE_TRANSIENT);
        }
        if (rc != SQLITE_OK) {
            return mapSqliteError(rc, "Failed to bind parameter");
        }
    }
    return Result<bool>(true);
}

Result<int64_t> SQLitePreparedStatements::executeInsert(const std::string& sql,
                                                         const std::vector<std::string>& values) {
    std::lock_guard<std::mutex> lock(conn_manager_.getMutex());

    auto prepareResult = prepareLocked(sql);
    if (!prepareResult.hasValue()) {
        return Error(prepareResult.error());
    }

    sqlite3_stmt* stmt = prepareResult.value();

    // Bind parameters
    auto bindResult = bindParameters(stmt, values);
    if (!bindResult.hasValue()) {
        finalize(stmt);
        return Error(bindResult.error());
    }

    // Execute
    const int rc = sqlite3_step(stmt);
    finalize(stmt);

    if (rc != SQLITE_DONE) {
        return mapSqliteError(rc, "Failed to execute insert");
    }

    // Return last inserted row ID
    const int64_t lastId = conn_manager_.getLastInsertRowId();
    return Result<int64_t>(lastId);
}

Result<sqlite3_stmt*> SQLitePreparedStatements::executeSelect(const std::string& sql,
                                                               const std::vector<std::string>& values) {
    std::lock_guard<std::mutex> lock(conn_manager_.getMutex());

    auto prepareResult = prepareLocked(sql);
    if (!prepareResult.hasValue()) {
        return Error(prepareResult.error());
    }

    sqlite3_stmt* stmt = prepareResult.value();

    // Bind parameters
    auto bindResult = bindParameters(stmt, values);
    if (!bindResult.hasValue()) {
        finalize(stmt);
        return Error(bindResult.error());
    }

    // Return statement for caller to iterate
    return Result<sqlite3_stmt*>(stmt);
}

Result<int> SQLitePreparedStatements::executeUpdate(const std::string& sql,
                                                     const std::vector<std::string>& values) {
    std::lock_guard<std::mutex> lock(conn_manager_.getMutex());

    auto prepareResult = prepareLocked(sql);
    if (!prepareResult.hasValue()) {
        return Error(prepareResult.error());
    }

    sqlite3_stmt* stmt = prepareResult.value();

    // Bind parameters
    auto bindResult = bindParameters(stmt, values);
    if (!bindResult.hasValue()) {
        finalize(stmt);
        return Error(bindResult.error());
    }

    // Execute
    const int rc = sqlite3_step(stmt);
    finalize(stmt);

    if (rc != SQLITE_DONE) {
        return mapSqliteError(rc, "Failed to execute update");
    }

    const int affected = conn_manager_.getChanges();
    return Result<int>(affected);
}

Result<int> SQLitePreparedStatements::executeDelete(const std::string& sql,
                                                     const std::vector<std::string>& values) {
    std::lock_guard<std::mutex> lock(conn_manager_.getMutex());

    auto prepareResult = prepareLocked(sql);
    if (!prepareResult.hasValue()) {
        return Error(prepareResult.error());
    }

    sqlite3_stmt* stmt = prepareResult.value();

    // Bind parameters
    auto bindResult = bindParameters(stmt, values);
    if (!bindResult.hasValue()) {
        finalize(stmt);
        return Error(bindResult.error());
    }

    // Execute
    const int rc = sqlite3_step(stmt);
    finalize(stmt);

    if (rc != SQLITE_DONE) {
        return mapSqliteError(rc, "Failed to execute delete");
    }

    const int affected = conn_manager_.getChanges();
    return Result<int>(affected);
}

void SQLitePreparedStatements::finalize(sqlite3_stmt* stmt) {
    if (stmt) {
        sqlite3_finalize(stmt);
    }
}

Error SQLitePreparedStatements::mapSqliteError(int code, const std::string& context) const {
    std::string errorMsg = context.empty() ? "" : context + ": ";
    if (conn_manager_.isOpen()) {
        errorMsg += sqlite3_errmsg(conn_manager_.getHandle());
    } else {
        errorMsg += "SQLite error code " + std::to_string(code);
    }

    switch (code) {
        case SQLITE_CONSTRAINT:
            return Error::conflict(errorMsg);
        case SQLITE_NOTFOUND:
            return Error::notFound(errorMsg);
        case SQLITE_BUSY:
        case SQLITE_LOCKED:
            return Error::internal("Database is locked: " + errorMsg);
        default:
            return Error::internal(errorMsg);
    }
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
