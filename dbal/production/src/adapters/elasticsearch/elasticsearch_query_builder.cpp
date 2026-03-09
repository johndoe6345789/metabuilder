#include "elasticsearch_query_builder.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

Json ElasticsearchQueryBuilder::buildSearchQuery(const Json& filter, int limit, int from) {
    Json query;

    if (filter.is_null() || filter.empty()) {
        query = buildMatchAllQuery();
    } else {
        query["query"] = buildBoolQuery(filter);
    }

    query["size"] = limit;
    query["from"] = from;

    return query;
}

Json ElasticsearchQueryBuilder::buildMatchAllQuery() {
    return {
        {"query", {
            {"match_all", Json::object()}
        }}
    };
}

Json ElasticsearchQueryBuilder::buildBoolQuery(const Json& filter) {
    Json bool_query = {
        {"bool", {
            {"must", Json::array()}
        }}
    };

    auto& must = bool_query["bool"]["must"];

    for (auto it = filter.begin(); it != filter.end(); ++it) {
        Json term_query = {
            {"term", {
                {it.key(), it.value()}
            }}
        };
        must.push_back(term_query);
    }

    return bool_query;
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
