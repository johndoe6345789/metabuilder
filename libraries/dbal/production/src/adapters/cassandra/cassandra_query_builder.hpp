#ifndef DBAL_CASSANDRA_QUERY_BUILDER_HPP
#define DBAL_CASSANDRA_QUERY_BUILDER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"
#include "dbal/adapters/adapter.hpp"

namespace dbal {
namespace adapters {
namespace cassandra {

using Json = nlohmann::json;

/**
 * Query Builder - Static utilities for constructing CQL queries
 *
 * Builds CREATE TABLE, INSERT, SELECT, UPDATE, DELETE statements
 * Handles type mapping from DBAL types to CQL types
 * Generates WHERE clauses and pagination
 */
class CassandraQueryBuilder {
public:
    /**
     * Build CREATE TABLE IF NOT EXISTS statement
     *
     * Maps DBAL types to CQL types:
     * - string → text
     * - number → double
     * - boolean → boolean
     * - timestamp → timestamp
     * - json → text
     *
     * Example:
     *   buildCreateTable(userSchema)
     *   → "CREATE TABLE IF NOT EXISTS users (id text, name text, age double, PRIMARY KEY (id))"
     */
    static std::string buildCreateTable(const EntitySchema& schema);

    /**
     * Build INSERT statement
     *
     * Example:
     *   buildInsert(userSchema)
     *   → "INSERT INTO users (id, name, age) VALUES (?, ?, ?)"
     */
    static std::string buildInsert(const EntitySchema& schema);

    /**
     * Build SELECT statement with optional WHERE and LIMIT
     *
     * Example:
     *   buildSelect(userSchema, true, true)
     *   → "SELECT * FROM users WHERE id = ? LIMIT ?"
     */
    static std::string buildSelect(const EntitySchema& schema, bool with_where = false, bool with_limit = false);

    /**
     * Build UPDATE statement
     *
     * Example:
     *   buildUpdate(userSchema)
     *   → "UPDATE users SET name = ?, age = ? WHERE id = ?"
     */
    static std::string buildUpdate(const EntitySchema& schema);

    /**
     * Build DELETE statement
     *
     * Example:
     *   buildDelete(userSchema)
     *   → "DELETE FROM users WHERE id = ?"
     */
    static std::string buildDelete(const EntitySchema& schema);

    /**
     * Build SELECT with filter and pagination for list operations
     *
     * Example:
     *   buildList(userSchema, {filter: {...}, limit: 10})
     *   → "SELECT * FROM users WHERE ... LIMIT 10"
     */
    static std::string buildList(const EntitySchema& schema, const ListOptions& options);

private:
    /**
     * Map DBAL field type to CQL type
     */
    static std::string mapTypeToCql(const std::string& dbal_type);

    /**
     * Build field list for INSERT/UPDATE
     */
    static std::string buildFieldList(const EntitySchema& schema);

    /**
     * Build placeholder list for INSERT VALUES clause
     */
    static std::string buildPlaceholders(size_t count);

    /**
     * Build SET clause for UPDATE
     */
    static std::string buildSetClause(const EntitySchema& schema);

    /**
     * Build WHERE clause from filter JSON
     */
    static std::string buildWhereClause(const Json& filter);
};

} // namespace cassandra
} // namespace adapters
} // namespace dbal

#endif // DBAL_CASSANDRA_QUERY_BUILDER_HPP
