#ifndef DBAL_SQL_QUERY_BUILDER_HPP
#define DBAL_SQL_QUERY_BUILDER_HPP

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"
#include "dbal/core/entity_loader.hpp"
#include "sql_connection.hpp"

namespace dbal {
namespace adapters {
namespace sql {

using Json = nlohmann::json;
using dbal::core::EntitySchema;
using dbal::core::EntityField;

/**
 * SQL Query Builder - Static utilities for constructing SQL statements
 *
 * Builds INSERT, SELECT, UPDATE, DELETE statements
 * Handles WHERE clauses, field lists, and placeholders
 */
class SqlQueryBuilder {
public:
    /**
     * Build INSERT statement with RETURNING clause
     *
     * Example (PostgreSQL):
     *   buildInsert("users", schema, data, Dialect::Postgres)
     *   → "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email"
     */
    static std::string buildInsert(const std::string& table_name,
                                   const EntitySchema& schema,
                                   const Json& data,
                                   Dialect dialect);

    /**
     * Build SELECT statement with optional WHERE clause
     *
     * Example:
     *   buildSelect("users", schema, {"id": "123"}, Dialect::Postgres)
     *   → "SELECT id, name, email FROM users WHERE id = $1"
     */
    static std::string buildSelect(const std::string& table_name,
                                   const EntitySchema& schema,
                                   const Json& filter,
                                   Dialect dialect);

    /**
     * Build UPDATE statement with WHERE clause and RETURNING
     *
     * Example:
     *   buildUpdate("users", schema, "123", data, Dialect::Postgres)
     *   → "UPDATE users SET name = $2, email = $3 WHERE id = $1 RETURNING id, name, email"
     */
    static std::string buildUpdate(const std::string& table_name,
                                   const EntitySchema& schema,
                                   const std::string& id,
                                   const Json& data,
                                   Dialect dialect);

    /**
     * Build DELETE statement with WHERE clause
     *
     * Example:
     *   buildDelete("users", "123", Dialect::Postgres)
     *   → "DELETE FROM users WHERE id = $1"
     */
    static std::string buildDelete(const std::string& table_name,
                                   const std::string& id,
                                   Dialect dialect);

    /**
     * Build SELECT with pagination and filtering
     *
     * Example:
     *   buildList("users", schema, options, Dialect::Postgres)
     *   → "SELECT id, name, email FROM users WHERE tenantId = $1 ORDER BY createdAt DESC LIMIT $2 OFFSET $3"
     */
    static std::string buildList(const std::string& table_name,
                                 const EntitySchema& schema,
                                 const ListOptions& options,
                                 Dialect dialect);

private:
    static std::string buildFieldList(const EntitySchema& schema);
    static std::string buildWhereClause(const Json& filter, Dialect dialect, int& param_index);
    static std::string placeholder(Dialect dialect, int index);
    static std::string joinFragments(const std::vector<std::string>& fragments, const std::string& separator);
};

} // namespace sql
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_QUERY_BUILDER_HPP
