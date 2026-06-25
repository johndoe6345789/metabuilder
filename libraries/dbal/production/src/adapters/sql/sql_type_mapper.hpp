#ifndef DBAL_SQL_TYPE_MAPPER_HPP
#define DBAL_SQL_TYPE_MAPPER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"
#include "sql_connection.hpp"

namespace dbal {
namespace adapters {
namespace sql {

using Json = nlohmann::json;

/**
 * SQL Type Mapper - Static utilities for converting between C++ and SQL types
 *
 * Handles:
 * - JSON → SQL parameter conversion
 * - SQL result → JSON conversion
 * - Type name mapping (YAML type → SQL type)
 * - Boolean, number, string conversions
 */
class SqlTypeMapper {
public:
    /**
     * Convert YAML field type to SQL column type
     *
     * Examples:
     *   yamlTypeToSqlType("string", Dialect::Postgres) → "VARCHAR(255)"
     *   yamlTypeToSqlType("bigint", Dialect::MySQL) → "BIGINT"
     *   yamlTypeToSqlType("boolean", Dialect::Postgres) → "BOOLEAN"
     */
    static std::string yamlTypeToSqlType(const std::string& yaml_type, Dialect dialect);

    /**
     * Convert JSON value to SQL parameter string
     *
     * Examples:
     *   jsonValueToString(42) → "42"
     *   jsonValueToString(true) → "1"
     *   jsonValueToString("hello") → "hello"
     *   jsonValueToString(null) → ""
     */
    static std::string jsonValueToString(const Json& value);

    /**
     * Convert SQL column value to JSON
     *
     * Examples:
     *   sqlValueToJson("42", "bigint") → 42
     *   sqlValueToJson("true", "boolean") → true
     *   sqlValueToJson("hello", "string") → "hello"
     */
    static Json sqlValueToJson(const std::string& value, const std::string& field_type);

    /**
     * Convert table name (PascalCase → snake_case)
     *
     * Examples:
     *   toSnakeCase("User") → "user"
     *   toSnakeCase("EmailClient") → "email_client"
     *   toSnakeCase("UIPage") → "ui_page"
     */
    static std::string toSnakeCase(const std::string& pascal_case);

private:
    static bool isNumericType(const std::string& field_type);
    static bool isBooleanType(const std::string& field_type);
};

} // namespace sql
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_TYPE_MAPPER_HPP
