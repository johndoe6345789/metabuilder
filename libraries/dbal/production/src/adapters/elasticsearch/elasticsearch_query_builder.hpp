#ifndef DBAL_ELASTICSEARCH_QUERY_BUILDER_HPP
#define DBAL_ELASTICSEARCH_QUERY_BUILDER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

using Json = nlohmann::json;

/**
 * Query Builder - Constructs Elasticsearch Query DSL
 *
 * Builds search queries with:
 * - Match all query (no filter)
 * - Bool query with term filters
 * - Pagination (size, from)
 * - Sorting
 */
class ElasticsearchQueryBuilder {
public:
    /**
     * Build search query with optional filtering and pagination
     *
     * Example:
     *   buildSearchQuery({filter: {"status": "active"}, limit: 10, page: 0})
     *   → { "query": { "bool": { "must": [ {"term": {"status": "active"}} ] } }, "size": 10, "from": 0 }
     */
    static Json buildSearchQuery(const Json& filter, int limit = 100, int from = 0);

    /**
     * Build match_all query (no filtering)
     */
    static Json buildMatchAllQuery();

private:
    /**
     * Build bool query with term filters
     */
    static Json buildBoolQuery(const Json& filter);
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif // DBAL_ELASTICSEARCH_QUERY_BUILDER_HPP
