#ifndef DBAL_ELASTICSEARCH_SEARCH_BUILDER_HPP
#define DBAL_ELASTICSEARCH_SEARCH_BUILDER_HPP

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/adapters/adapter.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

using Json = nlohmann::json;

/**
 * Search Builder - Parses Elasticsearch search responses
 *
 * Responsibilities:
 * - Extract documents from hits array
 * - Parse total count
 * - Handle pagination metadata
 * - Convert search results to ListResult
 */
class ElasticsearchSearchBuilder {
public:
    /**
     * Parse search response into ListResult
     *
     * Extracts:
     * - hits.hits[]._source → items
     * - hits.total.value → total count
     * - Preserves pagination metadata
     */
    static ListResult<Json> parseSearchResponse(const Json& response,
                                                 int page,
                                                 int limit);

    /**
     * Extract documents from hits array
     */
    static std::vector<Json> extractDocuments(const Json& response);

    /**
     * Extract total count from response
     */
    static int extractTotal(const Json& response);
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif // DBAL_ELASTICSEARCH_SEARCH_BUILDER_HPP
