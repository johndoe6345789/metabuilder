#include "elasticsearch_adapter.hpp"
#include "../../config/env_config.hpp"
#include "../schema_loader.hpp"
#include "elasticsearch_http_client.hpp"
#include "elasticsearch_index_manager.hpp"
#include "elasticsearch_query_builder.hpp"
#include "elasticsearch_search_builder.hpp"
#include "elasticsearch_bulk_operations.hpp"
#include "elasticsearch_type_converter.hpp"
#include "elasticsearch_url_parser.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace elasticsearch {

ElasticsearchAdapter::ElasticsearchAdapter(const std::string& connection_url)
    : schema_dir_(config::EnvConfig::getSchemaDir()) {

    spdlog::info("ElasticsearchAdapter: Connecting to Elasticsearch at {}", connection_url);

    try {
        // Parse connection URL
        auto config = ElasticsearchUrlParser::parse(connection_url);
        default_index_ = config.default_index;
        document_type_ = config.document_type;

        // Initialize HTTP client
        http_client_ = std::make_unique<ElasticsearchHttpClient>(
            config.base_url,
            config.refresh_policy,
            config.verify_certs
        );

        // Test connection
        auto health_result = http_client_->get("/_cluster/health");
        if (!health_result.isOk()) {
            throw std::runtime_error("Failed to connect to Elasticsearch: " + std::string(health_result.error().what()));
        }

        Json health = health_result.value();
        spdlog::info("ElasticsearchAdapter: Connected to cluster '{}', status: {}",
                    health.value("cluster_name", "unknown"),
                    health.value("status", "unknown"));

        // Initialize index manager
        index_manager_ = std::make_unique<ElasticsearchIndexManager>(*http_client_);

        // Load schemas and create indices
        loadSchemas();
        createIndices();

        spdlog::info("ElasticsearchAdapter: Connected successfully, loaded {} schemas", schemas_.size());
    } catch (const std::exception& e) {
        spdlog::error("ElasticsearchAdapter: Failed to connect: {}", e.what());
        throw;
    }
}

ElasticsearchAdapter::~ElasticsearchAdapter() {
    close();
}

void ElasticsearchAdapter::close() {
    spdlog::info("ElasticsearchAdapter: Connection closed");
}

void ElasticsearchAdapter::loadSchemas() {
    auto entities = SchemaLoader::loadFromDirectory(schema_dir_);
    for (const auto& entity : entities) {
        EntitySchema schema;
        schema.name = entity.name;
        schema.displayName = entity.description;
        for (const auto& field_def : entity.fields) {
            EntityField field;
            field.name = field_def.name;
            field.type = field_def.type;
            field.required = field_def.required;
            field.unique = field_def.unique;
            if (field_def.default_value.has_value()) {
                field.defaultValue = field_def.default_value.value();
            }
            schema.fields.push_back(field);
        }
        schemas_[entity.name] = schema;
    }
    spdlog::debug("ElasticsearchAdapter: Loaded {} entity schemas", schemas_.size());
}

std::optional<EntitySchema> ElasticsearchAdapter::getEntitySchemaInternal(const std::string& entityName) const {
    auto it = schemas_.find(entityName);
    if (it != schemas_.end()) {
        return it->second;
    }
    return std::nullopt;
}

void ElasticsearchAdapter::createIndices() {
    for (const auto& [entityName, schema] : schemas_) {
        std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
        index_manager_->createIndex(index_name, schema);
    }
}

// ===== Transaction Support =====

Result<bool> ElasticsearchAdapter::beginTransaction() {
    if (compensating_tx_ && compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "Transaction already in progress");
    }
    compensating_tx_ = std::make_unique<dbal::core::CompensatingTransaction>(*this);
    return Result<bool>(true);
}

Result<bool> ElasticsearchAdapter::commitTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "No transaction in progress");
    }
    compensating_tx_->commit();
    compensating_tx_.reset();
    return Result<bool>(true);
}

Result<bool> ElasticsearchAdapter::rollbackTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "No transaction in progress");
    }
    auto result = compensating_tx_->rollback();
    compensating_tx_.reset();
    return result;
}

// ===== CRUD Operations =====

Result<Json> ElasticsearchAdapter::create(const std::string& entityName, const Json& data) {
    auto schema_opt = getEntitySchemaInternal(entityName);
    if (!schema_opt) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }

    // Generate ID if not provided
    std::string id;
    if (data.contains("id") && !data["id"].is_null()) {
        id = data["id"].get<std::string>();
    } else {
        id = ElasticsearchTypeConverter::generateId();
    }

    Json record = data;
    record["id"] = id;

    std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
    std::string path = ElasticsearchTypeConverter::makeDocumentPath(index_name, document_type_, id);

    auto result = http_client_->put(path, record, true);
    if (!result.isOk()) {
        return Error(result.error().code(), result.error().what());
    }

    // Record operation for compensating transaction
    if (compensating_tx_ && compensating_tx_->isActive()) {
        compensating_tx_->recordCreate(entityName, id);
    }

    spdlog::debug("ElasticsearchAdapter: Created {} with id {}", entityName, id);
    return record;
}

Result<Json> ElasticsearchAdapter::read(const std::string& entityName, const std::string& id) {
    auto schema_opt = getEntitySchemaInternal(entityName);
    if (!schema_opt) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }

    std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
    std::string path = ElasticsearchTypeConverter::makeDocumentPath(index_name, document_type_, id);

    auto result = http_client_->get(path);
    if (!result.isOk()) {
        return Error(result.error().code(), result.error().what());
    }

    Json response = result.value();
    if (!response.value("found", false)) {
        return Error(ErrorCode::NotFound, entityName + " with id " + id + " not found");
    }

    if (response.contains("_source")) {
        return response["_source"];
    }

    return Error(ErrorCode::InternalError, "Elasticsearch response missing _source field");
}

Result<Json> ElasticsearchAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
    // Read existing record
    auto read_result = read(entityName, id);
    if (!read_result.isOk()) {
        return read_result;
    }

    // Snapshot old data for compensating transaction before update
    if (compensating_tx_ && compensating_tx_->isActive()) {
        compensating_tx_->recordUpdate(entityName, id, read_result.value());
    }

    Json record = read_result.value();

    // Merge updates
    for (auto it = data.begin(); it != data.end(); ++it) {
        record[it.key()] = it.value();
    }

    std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
    std::string path = ElasticsearchTypeConverter::makeDocumentPath(index_name, document_type_, id);

    auto result = http_client_->put(path, record, true);
    if (!result.isOk()) {
        return Error(result.error().code(), result.error().what());
    }

    spdlog::debug("ElasticsearchAdapter: Updated {} {}", entityName, id);
    return record;
}

Result<bool> ElasticsearchAdapter::remove(const std::string& entityName, const std::string& id) {
    // Snapshot old data for compensating transaction before delete
    if (compensating_tx_ && compensating_tx_->isActive()) {
        auto oldData = read(entityName, id);
        if (oldData.isOk()) {
            compensating_tx_->recordDelete(entityName, oldData.value());
        }
    }

    std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
    std::string path = ElasticsearchTypeConverter::makeDocumentPath(index_name, document_type_, id);

    auto result = http_client_->deleteRequest(path, true);
    if (!result.isOk()) {
        return Error(result.error().code(), result.error().what());
    }

    Json response = result.value();
    std::string result_status = response.value("result", "");

    if (result_status == "deleted") {
        spdlog::debug("ElasticsearchAdapter: Deleted {} {}", entityName, id);
        return true;
    }
    if (result_status == "not_found") {
        return Error(ErrorCode::NotFound, entityName + " with id " + id + " not found");
    }

    return Error(ErrorCode::InternalError, "Unexpected delete result: " + result_status);
}

Result<ListResult<Json>> ElasticsearchAdapter::list(const std::string& entityName, const ListOptions& options) {
    auto schema_opt = getEntitySchemaInternal(entityName);
    if (!schema_opt) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }

    try {
        int limit = options.limit > 0 ? options.limit : 100;
        int from = options.page * limit;

        Json search_body = ElasticsearchQueryBuilder::buildSearchQuery(options.filter, limit, from);

        std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
        std::string path = ElasticsearchTypeConverter::makeSearchPath(index_name);

        auto result = http_client_->post(path, search_body, false);
        if (!result.isOk()) {
            return Error(result.error().code(), result.error().what());
        }

        return ElasticsearchSearchBuilder::parseSearchResponse(result.value(), options.page, limit);
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, e.what());
    }
}

// ===== Bulk Operations =====

Result<int> ElasticsearchAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    if (records.empty()) {
        return 0;
    }

    std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
    auto ndjson_lines = ElasticsearchBulkOperations::buildIndexOperations(index_name, records);

    auto result = http_client_->bulk(ndjson_lines);
    if (!result.isOk()) {
        return Error(result.error().code(), result.error().what());
    }

    int success_count = ElasticsearchBulkOperations::countSuccesses(result.value(), "index");
    spdlog::debug("ElasticsearchAdapter: Bulk created {}/{} records for {}",
                 success_count, records.size(), entityName);
    return success_count;
}

Result<int> ElasticsearchAdapter::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    ListOptions options;
    options.limit = 10000;

    auto list_result = list(entityName, options);
    if (!list_result.isOk()) {
        return Error(list_result.error().code(), list_result.error().what());
    }

    if (list_result.value().items.empty()) {
        return 0;
    }

    std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
    auto ndjson_lines = ElasticsearchBulkOperations::buildUpdateOperations(
        index_name,
        list_result.value().items,
        data
    );

    auto result = http_client_->bulk(ndjson_lines);
    if (!result.isOk()) {
        return Error(result.error().code(), result.error().what());
    }

    int success_count = ElasticsearchBulkOperations::countSuccesses(result.value(), "update");
    spdlog::debug("ElasticsearchAdapter: Bulk updated {} records for {}", success_count, entityName);
    return success_count;
}

Result<int> ElasticsearchAdapter::deleteMany(const std::string& entityName, const Json& filter) {
    ListOptions options;
    options.limit = 10000;

    auto list_result = list(entityName, options);
    if (!list_result.isOk()) {
        return Error(list_result.error().code(), list_result.error().what());
    }

    if (list_result.value().items.empty()) {
        return 0;
    }

    std::string index_name = ElasticsearchTypeConverter::toIndexName(entityName);
    auto ndjson_lines = ElasticsearchBulkOperations::buildDeleteOperations(
        index_name,
        list_result.value().items
    );

    auto result = http_client_->bulk(ndjson_lines);
    if (!result.isOk()) {
        return Error(result.error().code(), result.error().what());
    }

    int success_count = ElasticsearchBulkOperations::countSuccesses(result.value(), "delete");
    spdlog::debug("ElasticsearchAdapter: Bulk deleted {} records for {}", success_count, entityName);
    return success_count;
}

// ===== Query Operations =====

Result<Json> ElasticsearchAdapter::findFirst(const std::string& entityName, const Json& filter) {
    ListOptions options;
    options.limit = 1;

    auto list_result = list(entityName, options);
    if (!list_result.isOk()) {
        return Error(list_result.error().code(), list_result.error().what());
    }

    if (list_result.value().items.empty()) {
        return Error(ErrorCode::NotFound, "No matching record found");
    }

    return list_result.value().items[0];
}

Result<Json> ElasticsearchAdapter::findByField(const std::string& entityName, const std::string& field, const Json& value) {
    Json filter;
    filter[field] = value;
    return findFirst(entityName, filter);
}

Result<Json> ElasticsearchAdapter::upsert(const std::string& entityName, const std::string& uniqueField,
                                         const Json& uniqueValue, const Json& createData, const Json& updateData) {
    auto find_result = findByField(entityName, uniqueField, uniqueValue);

    if (find_result.isOk()) {
        std::string id = find_result.value()["id"].get<std::string>();
        return update(entityName, id, updateData);
    }

    return create(entityName, createData);
}

// ===== Metadata =====

Result<std::vector<std::string>> ElasticsearchAdapter::getAvailableEntities() {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size());

    for (const auto& [name, schema] : schemas_) {
        entities.push_back(name);
    }

    return entities;
}

Result<EntitySchema> ElasticsearchAdapter::getEntitySchema(const std::string& entityName) {
    auto schema_opt = getEntitySchemaInternal(entityName);
    if (!schema_opt) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }
    return *schema_opt;
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
