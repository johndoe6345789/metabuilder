#include "elasticsearch_index_manager.hpp"
#include "elasticsearch_http_client.hpp"
#include "elasticsearch_type_converter.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace elasticsearch {

ElasticsearchIndexManager::ElasticsearchIndexManager(ElasticsearchHttpClient& http_client)
    : http_client_(http_client) {
}

bool ElasticsearchIndexManager::indexExists(const std::string& index_name) {
    auto result = http_client_.head("/" + index_name);
    return result.isOk();
}

bool ElasticsearchIndexManager::createIndex(const std::string& index_name, const EntitySchema& schema) {
    // Check if index already exists
    if (indexExists(index_name)) {
        spdlog::debug("ElasticsearchIndexManager: Index '{}' already exists", index_name);
        return true;
    }

    // Build mapping from schema
    std::string mapping_str = buildMapping(schema);
    Json create_body = Json::parse(mapping_str);

    // Create index
    auto result = http_client_.put("/" + index_name, create_body, false);
    if (!result.isOk()) {
        spdlog::warn("ElasticsearchIndexManager: Failed to create index '{}': {}",
                    index_name, result.error().what());
        return false;
    }

    spdlog::debug("ElasticsearchIndexManager: Created index '{}'", index_name);
    return true;
}

std::string ElasticsearchIndexManager::buildMapping(const EntitySchema& schema) const {
    Json mapping = {
        {"mappings", {
            {"properties", Json::object()}
        }}
    };

    auto& properties = mapping["mappings"]["properties"];

    // Add fields from schema
    for (const auto& field : schema.fields) {
        properties[field.name] = ElasticsearchTypeConverter::convertFieldType(field.type);
    }

    return mapping.dump();
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
