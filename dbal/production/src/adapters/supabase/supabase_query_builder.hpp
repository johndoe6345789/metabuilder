#ifndef DBAL_SUPABASE_QUERY_BUILDER_HPP
#define DBAL_SUPABASE_QUERY_BUILDER_HPP

#include <string>
#include <sstream>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"

namespace dbal {
namespace adapters {
namespace supabase {

using Json = nlohmann::json;

/**
 * Query Builder - Static utilities for constructing Supabase PostgREST filters
 *
 * Builds URL query strings for Supabase REST API:
 * - Filters: field=eq.value, field=gt.value, field=in.(val1,val2)
 * - Pagination: limit=N, offset=M
 * - Sorting: order=field.asc, order=field.desc
 *
 * PostgREST Filter Operators:
 * - eq: equals
 * - neq: not equals
 * - gt: greater than
 * - gte: greater than or equal
 * - lt: less than
 * - lte: less than or equal
 * - like: pattern matching (use * for wildcard)
 * - ilike: case-insensitive pattern matching
 * - is: is null/not null
 * - in: in list
 * - cs: contains (array/range)
 * - cd: contained by (array/range)
 *
 * Examples:
 * - /rest/v1/users?id=eq.123
 * - /rest/v1/users?status=eq.active&age=gt.18
 * - /rest/v1/users?limit=10&offset=20&order=name.asc
 */
class SupabaseQueryBuilder {
public:
    /**
     * Build PostgREST filter query string from JSON filter
     *
     * Example:
     *   buildFilterQuery({"status": "active", "age": 18})
     *   → "status=eq.active&age=eq.18"
     */
    static std::string buildFilterQuery(const Json& filter);

    /**
     * Build pagination query string (limit + offset)
     *
     * Example:
     *   buildPaginationQuery(10, 2)  // limit=10, page=2
     *   → "limit=10&offset=10"
     */
    static std::string buildPaginationQuery(int limit, int page);

    /**
     * Build sorting query string (order=field.asc/desc)
     *
     * Example:
     *   buildSortQuery({{"name", "asc"}, {"age", "desc"}})
     *   → "order=name.asc&order=age.desc"
     */
    static std::string buildSortQuery(const std::map<std::string, std::string>& sort);

    /**
     * Build complete list query with filters, pagination, sorting
     *
     * Example:
     *   buildListQuery("users", {filter: {"status": "active"}, limit: 10, page: 1})
     *   → "users?status=eq.active&limit=10&offset=0"
     */
    static std::string buildListQuery(const std::string& entity_name, const ListOptions& options);

    /**
     * Build read query with ID filter
     *
     * Example:
     *   buildReadQuery("users", "123")
     *   → "users?id=eq.123"
     */
    static std::string buildReadQuery(const std::string& entity_name, const std::string& id);

    /**
     * Build update/delete query with ID filter
     *
     * Example:
     *   buildIdFilterQuery("users", "123")
     *   → "users?id=eq.123"
     */
    static std::string buildIdFilterQuery(const std::string& entity_name, const std::string& id);

    /**
     * Escape value for PostgREST query string
     * Handles strings, numbers, booleans
     */
    static std::string escapeValue(const Json& value);
};

} // namespace supabase
} // namespace adapters
} // namespace dbal

#endif // DBAL_SUPABASE_QUERY_BUILDER_HPP
