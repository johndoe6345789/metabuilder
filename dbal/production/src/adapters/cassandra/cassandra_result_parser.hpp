#ifndef DBAL_CASSANDRA_RESULT_PARSER_HPP
#define DBAL_CASSANDRA_RESULT_PARSER_HPP

#include <cassandra.h>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/adapters/adapter.hpp"

namespace dbal {
namespace adapters {
namespace cassandra {

using Json = nlohmann::json;

/**
 * Result Parser - Converts CassResult to JSON objects
 *
 * Responsibilities:
 * - Extract values from CassRow based on entity schema
 * - Convert CQL types to JSON types
 * - Handle NULL values gracefully
 * - Build JSON objects matching entity schema
 */
class CassandraResultParser {
public:
    /**
     * Convert CassRow to JSON object
     *
     * @param row Cassandra result row
     * @param schema Entity schema for type information
     * @return JSON object with field names and values
     */
    static Json rowToJson(const CassRow* row, const EntitySchema& schema);

    /**
     * Convert CassResult to vector of JSON objects
     *
     * @param result Cassandra result set
     * @param schema Entity schema for type information
     * @return Vector of JSON objects (one per row)
     */
    static std::vector<Json> resultToJsonArray(const CassResult* result, const EntitySchema& schema);

    /**
     * Extract string value from column
     *
     * @param row Cassandra result row
     * @param index Column index
     * @return String value or empty string if NULL
     */
    static std::string getString(const CassRow* row, size_t index);

    /**
     * Extract double value from column
     *
     * @param row Cassandra result row
     * @param index Column index
     * @return Double value or 0.0 if NULL
     */
    static double getDouble(const CassRow* row, size_t index);

    /**
     * Extract boolean value from column
     *
     * @param row Cassandra result row
     * @param index Column index
     * @return Boolean value or false if NULL
     */
    static bool getBool(const CassRow* row, size_t index);

    /**
     * Extract timestamp value from column
     *
     * @param row Cassandra result row
     * @param index Column index
     * @return ISO 8601 timestamp string or empty string if NULL
     */
    static std::string getTimestamp(const CassRow* row, size_t index);

    /**
     * Check if column value is NULL
     *
     * @param row Cassandra result row
     * @param index Column index
     * @return true if NULL, false otherwise
     */
    static bool isNull(const CassRow* row, size_t index);

private:
    /**
     * Convert CassValue to JSON based on field type
     */
    static Json valueToJson(const CassValue* value, const std::string& field_type);
};

} // namespace cassandra
} // namespace adapters
} // namespace dbal

#endif // DBAL_CASSANDRA_RESULT_PARSER_HPP
