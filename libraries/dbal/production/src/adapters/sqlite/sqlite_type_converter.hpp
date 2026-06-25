#ifndef DBAL_SQLITE_TYPE_CONVERTER_HPP
#define DBAL_SQLITE_TYPE_CONVERTER_HPP

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"
#include "dbal/core/entity_loader.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

using Json = nlohmann::json;

/**
 * Type Converter - Static utilities for C++ ↔ SQLite type mapping
 *
 * Converts JSON values to SQLite-compatible strings
 * Handles booleans (0/1), numbers, strings, nulls
 * Provides parameter binding helpers
 */
class SQLiteTypeConverter {
public:
    /**
     * Convert JSON value to SQLite-compatible string
     *
     * Examples:
     *   jsonValueToString(true) → "1"
     *   jsonValueToString(false) → "0"
     *   jsonValueToString(42) → "42"
     *   jsonValueToString("hello") → "hello"
     *   jsonValueToString(null) → ""
     */
    static std::string jsonValueToString(const Json& value);

    /**
     * Extract values from JSON data based on schema
     *
     * Returns vector of string values in schema field order
     * Skips auto-generated fields (id, createdAt)
     * Optionally prepends an ID value
     */
    static std::vector<std::string> jsonToValues(const core::EntitySchema& schema,
                                                  const Json& data,
                                                  const std::string& prependId = "");

    /**
     * Build parameter vector for UPDATE operations
     *
     * Returns values in SET clause order, followed by WHERE clause values
     */
    static std::vector<std::string> buildUpdateParams(const core::EntitySchema& schema,
                                                       const Json& data,
                                                       const std::string& id);

    /**
     * Build parameter vector for bulk UPDATE operations
     */
    static std::vector<std::string> buildUpdateManyParams(const core::EntitySchema& schema,
                                                           const Json& filter,
                                                           const Json& data);

    /**
     * Build parameter vector for DELETE MANY operations
     */
    static std::vector<std::string> buildDeleteManyParams(const Json& filter);

    /**
     * Build parameter vector for FIND operations
     */
    static std::vector<std::string> buildFindParams(const Json& filter);

    /**
     * Build parameter vector for COUNT operations (same as list but without LIMIT/OFFSET)
     */
    static std::vector<std::string> buildCountParams(const ListOptions& options);

    /**
     * Build parameter vector for LIST operations
     */
    static std::vector<std::string> buildListParams(const ListOptions& options);

private:
    static void appendConditionValues(const FilterCondition& cond,
                                      std::vector<std::string>& out);
};

} // namespace sqlite
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQLITE_TYPE_CONVERTER_HPP
