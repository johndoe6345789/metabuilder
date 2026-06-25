#include "surrealdb_adapter.hpp"
#include "../../config/env_config.hpp"
#include "surrealdb_auth.hpp"
#include "surrealdb_http_client.hpp"
#include "surrealdb_query_builder.hpp"
#include "surrealdb_type_converter.hpp"
#include "surrealdb_schema_manager.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace surrealdb {

SurrealDBAdapter::SurrealDBAdapter(const std::string& connection_url)
    : connection_url_(connection_url),
      auth_(connection_url, "metabuilder", "metabuilder", "root", "root"),
      http_client_(connection_url, "metabuilder", "metabuilder"),
      schema_manager_(config::EnvConfig::getSchemaDir()) {
    
    spdlog::info("SurrealDBAdapter: Connecting to SurrealDB at {}", connection_url);
    
    try {
        // Authenticate
        auto signin_result = auth_.signin();
        if (!signin_result.isOk()) {
            throw std::runtime_error(std::string("Failed to authenticate: ") + signin_result.error().what());
        }
        
        // Set auth token in HTTP client
        http_client_.setAuthToken(auth_.getAuthToken());
        
        // Load entity schemas
        schema_manager_.loadSchemas();
        
        spdlog::info("SurrealDBAdapter: Connected successfully, loaded {} schemas", 
                    schema_manager_.getSchemaCount());
    } catch (const std::exception& e) {
        spdlog::error("SurrealDBAdapter: Failed to connect: {}", e.what());
        throw;
    }
}

SurrealDBAdapter::~SurrealDBAdapter() {
    close();
}

void SurrealDBAdapter::close() {
    auth_.clearAuth();
    spdlog::info("SurrealDBAdapter: Connection closed");
}

// ===== Transaction Support =====

Result<bool> SurrealDBAdapter::beginTransaction() {
    if (compensating_tx_ && compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "Transaction already in progress");
    }
    compensating_tx_ = std::make_unique<dbal::core::CompensatingTransaction>(*this);
    return Result<bool>(true);
}

Result<bool> SurrealDBAdapter::commitTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "No transaction in progress");
    }
    compensating_tx_->commit();
    compensating_tx_.reset();
    return Result<bool>(true);
}

Result<bool> SurrealDBAdapter::rollbackTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "No transaction in progress");
    }
    auto result = compensating_tx_->rollback();
    compensating_tx_.reset();
    return result;
}

// ===== CRUD Operations =====

Result<Json> SurrealDBAdapter::create(const std::string& entityName, const Json& data) {
    const std::string resource_path = SurrealDBTypeConverter::makeResourcePath(entityName);
    auto result = http_client_.post("/key/" + resource_path, data);

    // Record operation for compensating transaction
    if (result.isOk() && compensating_tx_ && compensating_tx_->isActive()) {
        std::string id = result.value().contains("id") ? result.value()["id"].get<std::string>() : "";
        compensating_tx_->recordCreate(entityName, id);
    }

    return result;
}

Result<Json> SurrealDBAdapter::read(const std::string& entityName, const std::string& id) {
    const std::string resource_path = SurrealDBTypeConverter::makeResourcePath(entityName, id);
    auto result = http_client_.get(resource_path);
    
    if (!result.isOk() && result.error().code() == ErrorCode::NotFound) {
        return Error(ErrorCode::NotFound, entityName + " with id " + id + " not found");
    }
    
    return result;
}

Result<Json> SurrealDBAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
    // Snapshot old data for compensating transaction before update
    if (compensating_tx_ && compensating_tx_->isActive()) {
        auto oldData = read(entityName, id);
        if (oldData.isOk()) {
            compensating_tx_->recordUpdate(entityName, id, oldData.value());
        }
    }

    const std::string resource_path = SurrealDBTypeConverter::makeResourcePath(entityName, id);
    return http_client_.patch(resource_path, data);
}

Result<bool> SurrealDBAdapter::remove(const std::string& entityName, const std::string& id) {
    // Snapshot old data for compensating transaction before delete
    if (compensating_tx_ && compensating_tx_->isActive()) {
        auto oldData = read(entityName, id);
        if (oldData.isOk()) {
            compensating_tx_->recordDelete(entityName, oldData.value());
        }
    }

    const std::string resource_path = SurrealDBTypeConverter::makeResourcePath(entityName, id);
    return http_client_.deleteRequest(resource_path);
}

Result<ListResult<Json>> SurrealDBAdapter::list(const std::string& entityName, const ListOptions& options) {
    try {
        const std::string query = SurrealDBQueryBuilder::buildSelectQuery(entityName, options);
        
        auto query_result = http_client_.executeSql(query);
        if (!query_result.isOk()) {
            return Error(query_result.error().code(), query_result.error().what());
        }
        
        const Json response = query_result.value();
        
        // Parse response
        std::vector<Json> items;
        if (response.is_array() && !response.empty() && response[0].contains("result")) {
            items = response[0]["result"].get<std::vector<Json>>();
        }
        
        ListResult<Json> result;
        result.items = items;
        result.total = static_cast<int>(items.size());  // Fixed: explicit cast
        result.page = options.page;
        result.limit = options.limit;
        
        return result;
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, e.what());
    }
}

// ===== Bulk Operations =====

Result<int> SurrealDBAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    int count = 0;
    for (const auto& record : records) {
        auto result = create(entityName, record);
        if (result.isOk()) {
            ++count;
        }
    }
    return count;
}

Result<int> SurrealDBAdapter::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    return Error(ErrorCode::CapabilityNotSupported, "SurrealDBAdapter::updateMany not yet implemented");
}

Result<int> SurrealDBAdapter::deleteMany(const std::string& entityName, const Json& filter) {
    return Error(ErrorCode::CapabilityNotSupported, "SurrealDBAdapter::deleteMany not yet implemented");
}

// ===== Query Operations =====

Result<Json> SurrealDBAdapter::findFirst(const std::string& entityName, const Json& filter) {
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

Result<Json> SurrealDBAdapter::findByField(const std::string& entityName, const std::string& field, const Json& value) {
    Json filter;
    filter[field] = value;
    return findFirst(entityName, filter);
}

Result<Json> SurrealDBAdapter::upsert(const std::string& entityName, const std::string& uniqueField,
                                      const Json& uniqueValue, const Json& createData, const Json& updateData) {
    // Try to find existing record
    auto find_result = findByField(entityName, uniqueField, uniqueValue);
    
    if (find_result.isOk()) {
        // Record exists, update it
        const std::string id = find_result.value()["id"].get<std::string>();
        return update(entityName, id, updateData);
    }
    
    // Record doesn't exist, create it
    return create(entityName, createData);
}

// ===== Metadata =====

Result<std::vector<std::string>> SurrealDBAdapter::getAvailableEntities() {
    return schema_manager_.getAvailableEntities();
}

Result<EntitySchema> SurrealDBAdapter::getEntitySchema(const std::string& entityName) {
    auto schema_opt = schema_manager_.getSchema(entityName);
    if (!schema_opt) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }
    return *schema_opt;
}

} // namespace surrealdb
} // namespace adapters
} // namespace dbal
