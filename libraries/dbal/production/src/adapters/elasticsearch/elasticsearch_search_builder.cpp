#include "elasticsearch_search_builder.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

ListResult<Json> ElasticsearchSearchBuilder::parseSearchResponse(const Json& response, int page, int limit) {
    ListResult<Json> result;
    result.items = extractDocuments(response);
    result.total = extractTotal(response);
    result.page = page;
    result.limit = limit;
    return result;
}

std::vector<Json> ElasticsearchSearchBuilder::extractDocuments(const Json& response) {
    std::vector<Json> items;

    if (!response.contains("hits")) {
        return items;
    }

    auto hits = response["hits"];
    if (!hits.contains("hits") || !hits["hits"].is_array()) {
        return items;
    }

    for (const auto& hit : hits["hits"]) {
        if (hit.contains("_source")) {
            items.push_back(hit["_source"]);
        }
    }

    return items;
}

int ElasticsearchSearchBuilder::extractTotal(const Json& response) {
    if (!response.contains("hits")) {
        return 0;
    }

    auto hits = response["hits"];
    if (!hits.contains("total")) {
        return 0;
    }

    auto total_obj = hits["total"];

    // ES 7+ returns object with "value" field
    if (total_obj.is_object() && total_obj.contains("value")) {
        return total_obj["value"].get<int>();
    }

    // ES 6 returns integer directly
    if (total_obj.is_number()) {
        return total_obj.get<int>();
    }

    return 0;
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
