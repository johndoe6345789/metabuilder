#ifndef DBAL_ELASTICSEARCH_ADAPTER_HPP
#define DBAL_ELASTICSEARCH_ADAPTER_HPP

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

#include "dbal/adapters/adapter.hpp"
#include "dbal/core/compensating_transaction.hpp"
#include "dbal/types.hpp"
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

using Json = nlohmann::json;

// Forward declarations
class ElasticsearchHttpClient;
class ElasticsearchIndexManager;

/**
 * Elasticsearch Adapter - Full-Text Search Engine implementation for DBAL
 *
 * Uses Elasticsearch REST API for search-optimized document storage
 * Follows SurrealDB adapter pattern with small helper classes
 *
 * DATABASE_URL format:
 * elasticsearch://host:port?index=default&type=_doc&refresh=true&verify_certs=true
 */
class ElasticsearchAdapter : public Adapter {
public:
    explicit ElasticsearchAdapter(const std::string& connection_url);
    ~ElasticsearchAdapter() override;

    // ===== Transaction Support (Compensating) =====

    bool supportsNativeTransactions() const override { return false; }
    Result<bool> beginTransaction() override;
    Result<bool> commitTransaction() override;
    Result<bool> rollbackTransaction() override;

    // ===== Generic CRUD Operations =====

    Result<Json> create(const std::string& entityName, const Json& data) override;
    Result<Json> read(const std::string& entityName, const std::string& id) override;
    Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) override;
    Result<bool> remove(const std::string& entityName, const std::string& id) override;
    Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) override;

    // ===== Bulk Operations =====

    Result<int> createMany(const std::string& entityName, const std::vector<Json>& records) override;
    Result<int> updateMany(const std::string& entityName, const Json& filter, const Json& data) override;
    Result<int> deleteMany(const std::string& entityName, const Json& filter) override;

    // ===== Query Operations =====

    Result<Json> findFirst(const std::string& entityName, const Json& filter) override;
    Result<Json> findByField(const std::string& entityName, const std::string& field, const Json& value) override;
    Result<Json> upsert(const std::string& entityName, const std::string& uniqueField,
                       const Json& uniqueValue, const Json& createData, const Json& updateData) override;

    // ===== Metadata =====

    Result<std::vector<std::string>> getAvailableEntities() override;
    Result<EntitySchema> getEntitySchema(const std::string& entityName) override;

    void close() override;

private:
    void loadSchemas();
    void createIndices();
    std::optional<EntitySchema> getEntitySchemaInternal(const std::string& entityName) const;

    std::string default_index_;
    std::string document_type_;
    std::unordered_map<std::string, EntitySchema> schemas_;
    std::string schema_dir_;

    // Helper classes (using unique_ptr for forward declarations)
    std::unique_ptr<ElasticsearchHttpClient> http_client_;
    std::unique_ptr<ElasticsearchIndexManager> index_manager_;
    std::unique_ptr<dbal::core::CompensatingTransaction> compensating_tx_;
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif
