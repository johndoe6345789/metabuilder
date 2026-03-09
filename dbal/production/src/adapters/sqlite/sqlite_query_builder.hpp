#ifndef DBAL_SQLITE_QUERY_BUILDER_HPP
#define DBAL_SQLITE_QUERY_BUILDER_HPP

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
 * Query Builder - Static utilities for constructing SQL queries
 *
 * Builds INSERT, SELECT, UPDATE, DELETE statements
 * Handles parameterized queries with ? placeholders
 * Converts field names and builds WHERE clauses
 */
class SQLiteQueryBuilder {
public:
    /**
     * Build INSERT statement with ? placeholders
     *
     * Example:
     *   buildInsertQuery("users", schema, {"name": "Alice", "age": 30})
     *   → "INSERT INTO users (name, age) VALUES (?, ?)"
     */
    static std::string buildInsertQuery(const core::EntitySchema& schema, const Json& data);

    /**
     * Build SELECT statement with optional WHERE clause
     *
     * Example:
     *   buildSelectQuery("users", schema, {"id": "123"})
     *   → "SELECT id, name, age FROM users WHERE id = ?"
     */
    static std::string buildSelectQuery(const core::EntitySchema& schema, const Json& filter);

    /**
     * Build UPDATE statement with WHERE id = ?
     *
     * Example:
     *   buildUpdateQuery("users", schema, "123", {"name": "Bob"})
     *   → "UPDATE users SET name = ? WHERE id = ?"
     */
    static std::string buildUpdateQuery(const core::EntitySchema& schema,
                                        const std::string& id,
                                        const Json& data);

    /**
     * Build DELETE statement
     *
     * Example:
     *   buildDeleteQuery("users", schema, "123")
     *   → "DELETE FROM users WHERE id = ?"
     */
    static std::string buildDeleteQuery(const core::EntitySchema& schema, const std::string& id);

    /**
     * Build LIST query with pagination and filtering
     *
     * Example:
     *   buildListQuery("users", schema, {limit: 10, page: 1, filter: {"status": "active"}})
     *   → "SELECT * FROM users WHERE status = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?"
     */
    static std::string buildListQuery(const core::EntitySchema& schema, const ListOptions& options);

    /**
     * Build UPDATE MANY query
     */
    static std::string buildUpdateManyQuery(const core::EntitySchema& schema,
                                           const Json& filter,
                                           const Json& data);

    /**
     * Build DELETE MANY query
     */
    static std::string buildDeleteManyQuery(const core::EntitySchema& schema, const Json& filter);

    /**
     * Build FIND FIRST query
     */
    static std::string buildFindFirstQuery(const core::EntitySchema& schema, const Json& filter);

    /**
     * Build comma-separated field list
     */
    static std::string buildFieldList(const core::EntitySchema& schema);

    /**
     * Build WHERE clause from filter JSON
     */
    static std::string buildWhereClause(const Json& filter);

    /**
     * Build SELECT COUNT(*) query using the same WHERE/GROUP BY as buildListQuery.
     * Returns total matching rows for pagination.
     */
    static std::string buildCountQuery(const core::EntitySchema& schema,
                                       const ListOptions& options);

    /**
     * Convert a typed FilterCondition to a SQL fragment with ? placeholders
     */
    static std::string conditionToSql(const FilterCondition& cond);

    /**
     * Convert PascalCase to lower_snake_case
     */
    static std::string toLowerSnakeCase(const std::string& pascalCase);

    /**
     * Quote identifier with double quotes for SQL
     */
    static std::string quoteId(const std::string& identifier);

    /**
     * Join string fragments with separator
     */
    static std::string joinFragments(const std::vector<std::string>& fragments,
                                     const std::string& separator);
};

} // namespace sqlite
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQLITE_QUERY_BUILDER_HPP
