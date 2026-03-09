#ifndef DBAL_SQL_RESULT_PARSER_HPP
#define DBAL_SQL_RESULT_PARSER_HPP

#include <string>
#include <vector>
#include <map>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"
#include "dbal/adapters/adapter.hpp"
#include "dbal/core/entity_loader.hpp"

namespace dbal {
namespace adapters {
namespace sql {

using Json = nlohmann::json;
using dbal::adapters::EntitySchema;
using dbal::adapters::EntityField;

/**
 * SQL Result Row - Represents a single row from query results
 */
struct SqlRow {
    std::map<std::string, std::string> columns;
};

/**
 * SQL Result Parser - Converts SQL query results to JSON
 *
 * Handles:
 * - Row → JSON object conversion
 * - Type-aware value parsing (boolean, number, string)
 * - Multi-row result sets
 * - Column name mapping
 */
class SqlResultParser {
public:
    /**
     * Convert a single SQL row to JSON object
     *
     * Example:
     *   SqlRow row = {{"id", "1"}, {"name", "Alice"}, {"age", "30"}};
     *   rowToJson(row, schema) → {"id": 1, "name": "Alice", "age": 30}
     */
    static Json rowToJson(const SqlRow& row, const EntitySchema& schema);

    /**
     * Convert multiple SQL rows to JSON array
     *
     * Example:
     *   rowsToJson(rows, schema) → [{"id": 1, ...}, {"id": 2, ...}]
     */
    static std::vector<Json> rowsToJson(const std::vector<SqlRow>& rows,
                                       const EntitySchema& schema);

    /**
     * Get column value from row (with default empty string)
     */
    static std::string getColumnValue(const SqlRow& row, const std::string& column_name);

    /**
     * Parse SQL parameters from JSON data
     *
     * Example:
     *   jsonToParams(schema, {"name": "Alice", "age": 30})
     *   → [{"name", "Alice"}, {"age", "30"}]
     */
    static std::vector<std::pair<std::string, std::string>>
    jsonToParams(const EntitySchema& schema, const Json& data, const std::string& prepend_id = "");

private:
    static Json parseValue(const std::string& value, const EntityField& field);
};

} // namespace sql
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_RESULT_PARSER_HPP
