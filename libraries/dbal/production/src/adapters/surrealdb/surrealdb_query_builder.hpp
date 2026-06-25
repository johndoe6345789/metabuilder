#ifndef DBAL_SURREALDB_QUERY_BUILDER_HPP
#define DBAL_SURREALDB_QUERY_BUILDER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"

namespace dbal {
namespace adapters {
namespace surrealdb {

using Json = nlohmann::json;

/**
 * Query Builder - Static utilities for constructing SurrealQL queries
 *
 * Builds SELECT, CREATE, UPDATE, DELETE statements
 * Handles filtering, pagination, and value escaping
 */
class SurrealDBQueryBuilder {
public:
    /**
     * Build SELECT query with optional filtering and pagination
     *
     * Example:
     *   buildSelectQuery("users", {filter: {"status": "active"}, limit: 10, page: 0})
     *   → "SELECT * FROM users WHERE status = 'active' LIMIT 10 START 0"
     */
    static std::string buildSelectQuery(const std::string& entity_name, 
                                        const ListOptions& options);
    
    /**
     * Build CREATE query (insert new record)
     *
     * Example:
     *   buildCreateQuery("users", {"name": "Alice", "age": 30})
     *   → "CREATE users SET name = 'Alice', age = 30"
     */
    static std::string buildCreateQuery(const std::string& entity_name, 
                                        const Json& data);
    
    /**
     * Build UPDATE query (modify existing record)
     *
     * Example:
     *   buildUpdateQuery("users", "123", {"name": "Bob"})
     *   → "UPDATE users:123 SET name = 'Bob'"
     */
    static std::string buildUpdateQuery(const std::string& entity_name, 
                                        const std::string& id, 
                                        const Json& data);
    
    /**
     * Build DELETE query (remove record)
     *
     * Example:
     *   buildDeleteQuery("users", "123")
     *   → "DELETE users:123"
     */
    static std::string buildDeleteQuery(const std::string& entity_name, 
                                        const std::string& id);
    
private:
    static std::string buildWhereClause(const Json& filter);
    static std::string buildLimitClause(int limit, int page);
    static std::string buildSetClause(const Json& data);
};

} // namespace surrealdb
} // namespace adapters
} // namespace dbal

#endif // DBAL_SURREALDB_QUERY_BUILDER_HPP
