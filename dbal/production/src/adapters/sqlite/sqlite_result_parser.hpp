#ifndef DBAL_SQLITE_RESULT_PARSER_HPP
#define DBAL_SQLITE_RESULT_PARSER_HPP

#include <sqlite3.h>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "dbal/core/entity_loader.hpp"
#include "sqlite_connection_manager.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

using Json = nlohmann::json;

/**
 * Result Parser - Converts sqlite3_stmt results to JSON
 *
 * Reads row data from prepared statements
 * Maps SQLite column types to JSON types
 * Handles type conversions (BOOLEAN, INTEGER, TEXT, NULL)
 * Builds JSON objects from database rows
 */
class SQLiteResultParser {
public:
    explicit SQLiteResultParser(SQLiteConnectionManager& conn_manager);
    ~SQLiteResultParser() = default;

    /**
     * Parse a single row from statement to JSON
     *
     * Reads all columns and converts to appropriate JSON types
     * Uses schema to determine proper type conversions
     */
    Json rowToJson(const core::EntitySchema& schema, sqlite3_stmt* stmt) const;

    /**
     * Read all rows from SELECT statement
     *
     * Returns vector of JSON objects
     * Automatically finalizes the statement when done
     */
    Result<std::vector<Json>> readAllRows(const core::EntitySchema& schema, sqlite3_stmt* stmt);

    /**
     * Read a single record by rowid after INSERT
     *
     * Helper for returning the inserted record
     */
    Result<Json> readInsertedRecord(const core::EntitySchema& schema, int64_t rowid);

private:
    /**
     * Convert SQLite column value to JSON based on field type
     */
    Json columnToJson(const core::EntityField& field, sqlite3_stmt* stmt, int columnIndex) const;

    SQLiteConnectionManager& conn_manager_;
};

} // namespace sqlite
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQLITE_RESULT_PARSER_HPP
