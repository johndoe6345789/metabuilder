#ifndef DBAL_SURREALDB_TYPE_CONVERTER_HPP
#define DBAL_SURREALDB_TYPE_CONVERTER_HPP

#include <string>
#include <nlohmann/json.hpp>

namespace dbal {
namespace adapters {
namespace surrealdb {

using Json = nlohmann::json;

/**
 * Type Converter - Static utilities for converting between JSON and SurrealDB values
 *
 * Handles:
 * - JSON strings → SurrealDB string literals (with quoting)
 * - JSON numbers → SurrealDB numbers
 * - JSON booleans → SurrealDB true/false
 * - JSON null → SurrealDB NULL
 * - Filter objects → WHERE clause predicates
 * - Resource path construction (entity/id)
 */
class SurrealDBTypeConverter {
public:
    /**
     * Convert JSON value to SurrealDB value representation
     * 
     * Examples:
     *   "hello" → '

hello'
     *   42 → 42
     *   true → true
     *   null → NULL
     */
    static std::string jsonToSurrealValue(const Json& value);
    
    /**
     * Build resource path from entity name and optional ID
     * 
     * Examples:
     *   makeResourcePath("users", "") → "users"
     *   makeResourcePath("users", "123") → "users/123"
     */
    static std::string makeResourcePath(const std::string& entity_name, 
                                        const std::string& id = "");
    
    /**
     * Convert JSON filter object to SurrealDB WHERE clause
     * 
     * Example:
     *   {"status": "active", "age": 25} → "status = 'active' AND age = 25"
     */
    static std::string filterToWhere(const Json& filter);
    
private:
    static std::string quoteString(const std::string& str);
    static std::string escapeString(const std::string& str);
};

} // namespace surrealdb
} // namespace adapters
} // namespace dbal

#endif // DBAL_SURREALDB_TYPE_CONVERTER_HPP
