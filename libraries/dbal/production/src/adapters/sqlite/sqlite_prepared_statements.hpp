#ifndef DBAL_SQLITE_PREPARED_STATEMENTS_HPP
#define DBAL_SQLITE_PREPARED_STATEMENTS_HPP

#include <sqlite3.h>
#include <string>
#include <vector>
#include "dbal/errors.hpp"
#include "sqlite_connection_manager.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

/**
 * Prepared Statements - Handles SQLite statement preparation and execution
 *
 * Prepares SQL statements for execution
 * Binds parameters to ? placeholders
 * Executes queries and returns results
 * Manages statement lifecycle (prepare → bind → execute → finalize)
 */
class SQLitePreparedStatements {
public:
    explicit SQLitePreparedStatements(SQLiteConnectionManager& conn_manager);
    ~SQLitePreparedStatements() = default;

    /**
     * Execute INSERT statement and return inserted row ID
     */
    Result<int64_t> executeInsert(const std::string& sql,
                                   const std::vector<std::string>& values);

    /**
     * Execute SELECT statement and return raw statement handle
     * Caller must call finalize() when done
     */
    Result<sqlite3_stmt*> executeSelect(const std::string& sql,
                                        const std::vector<std::string>& values);

    /**
     * Execute UPDATE statement and return number of affected rows
     */
    Result<int> executeUpdate(const std::string& sql,
                              const std::vector<std::string>& values);

    /**
     * Execute DELETE statement and return number of affected rows
     */
    Result<int> executeDelete(const std::string& sql,
                              const std::vector<std::string>& values);

    /**
     * Finalize a statement (cleanup)
     */
    void finalize(sqlite3_stmt* stmt);

    /**
     * Prepare a SQL statement (acquires connection mutex)
     */
    Result<sqlite3_stmt*> prepare(const std::string& sql);

private:
    /**
     * Prepare a SQL statement (caller must already hold connection mutex)
     */
    Result<sqlite3_stmt*> prepareLocked(const std::string& sql);

    /**
     * Bind parameters to prepared statement
     */
    Result<bool> bindParameters(sqlite3_stmt* stmt,
                                const std::vector<std::string>& values);

    /**
     * Map SQLite error codes to DBAL errors
     */
    Error mapSqliteError(int code, const std::string& context = "") const;

    SQLiteConnectionManager& conn_manager_;
};

} // namespace sqlite
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQLITE_PREPARED_STATEMENTS_HPP
