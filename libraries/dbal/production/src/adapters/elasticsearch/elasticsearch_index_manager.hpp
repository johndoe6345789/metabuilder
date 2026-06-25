#ifndef DBAL_ELASTICSEARCH_INDEX_MANAGER_HPP
#define DBAL_ELASTICSEARCH_INDEX_MANAGER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/adapters/adapter.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

using Json = nlohmann::json;

class ElasticsearchHttpClient;

/**
 * Index Manager - Creates and manages Elasticsearch indices
 *
 * Responsibilities:
 * - Check if index exists
 * - Create index with mappings
 * - Build mapping from entity schema
 * - Convert DBAL field types to Elasticsearch types
 */
class ElasticsearchIndexManager {
public:
    explicit ElasticsearchIndexManager(ElasticsearchHttpClient& http_client);

    /**
     * Check if index exists
     */
    bool indexExists(const std::string& index_name);

    /**
     * Create index with mapping from schema
     */
    bool createIndex(const std::string& index_name, const EntitySchema& schema);

    /**
     * Build Elasticsearch mapping from entity schema
     */
    std::string buildMapping(const EntitySchema& schema) const;

private:
    ElasticsearchHttpClient& http_client_;
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif // DBAL_ELASTICSEARCH_INDEX_MANAGER_HPP
