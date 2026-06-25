#include "cassandra_adapter.hpp"
#include "../../config/env_config.hpp"
#include <memory>
#include <spdlog/spdlog.h>
#include <uuid/uuid.h>

namespace {
    struct CassFutureDeleter {
        void operator()(CassFuture* f) const { if (f) cass_future_free(f); }
    };
    struct CassStatementDeleter {
        void operator()(CassStatement* s) const { if (s) cass_statement_free(s); }
    };
    using UniqueCassFuture = std::unique_ptr<CassFuture, CassFutureDeleter>;
    using UniqueCassStatement = std::unique_ptr<CassStatement, CassStatementDeleter>;
} // anonymous namespace

namespace dbal {
namespace adapters {
namespace cassandra {

CassandraAdapter::CassandraAdapter(const std::string& connection_url)
    : connection_manager_(connection_url),
      schema_dir_(config::EnvConfig::getSchemaDir()) {

    spdlog::info("CassandraAdapter: Initializing adapter");

    // Connect to Cassandra
    auto connect_result = connection_manager_.connect();
    if (!connect_result.isOk()) {
        throw std::runtime_error("Failed to connect: " + std::string(connect_result.error().what()));
    }

    // Initialize prepared statements manager
    CassSession* session = connection_manager_.getSession();
    if (!session) {
        spdlog::error("CassandraAdapter: Failed to get session for prepared statements");
        throw std::runtime_error("Cassandra session not available after connect");
    }
    prepared_statements_ = std::make_unique<CassandraPreparedStatements>(session);

    // Load schemas and create tables
    loadSchemas();
    createTables();

    spdlog::info("CassandraAdapter: Initialized successfully with {} schemas", schemas_.size());
}

CassandraAdapter::~CassandraAdapter() {
    close();
}

void CassandraAdapter::close() {
    if (prepared_statements_) {
        prepared_statements_->clear();
    }
    connection_manager_.close();
}

void CassandraAdapter::loadSchemas() {
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
    spdlog::debug("CassandraAdapter: Loaded {} entity schemas", schemas_.size());
}

void CassandraAdapter::createTables() {
    for (const auto& [entityName, schema] : schemas_) {
        std::string create_cql = CassandraQueryBuilder::buildCreateTable(schema);

        const CassPrepared* prepared = prepared_statements_->getPrepared(create_cql);
        if (prepared == nullptr) {
            spdlog::warn("CassandraAdapter: Failed to prepare CREATE TABLE for {}", entityName);
            continue;
        }

        UniqueCassStatement statement(cass_prepared_bind(prepared));
        UniqueCassFuture query_future(cass_session_execute(connection_manager_.getSession(), statement.get()));
        CassError rc = cass_future_error_code(query_future.get());

        if (rc != CASS_OK) {
            spdlog::warn("CassandraAdapter: Failed to create table {}: {}", entityName, cass_error_desc(rc));
        } else {
            spdlog::debug("CassandraAdapter: Created table {}", entityName);
        }
    }
}

std::optional<EntitySchema> CassandraAdapter::getEntitySchemaInternal(const std::string& entityName) const {
    auto it = schemas_.find(entityName);
    if (it != schemas_.end()) {
        return it->second;
    }
    return std::nullopt;
}

// ===== Transaction Support =====

Result<bool> CassandraAdapter::beginTransaction() {
    if (compensating_tx_ && compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "Transaction already in progress");
    }
    compensating_tx_ = std::make_unique<dbal::core::CompensatingTransaction>(*this);
    return Result<bool>(true);
}

Result<bool> CassandraAdapter::commitTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "No transaction in progress");
    }
    compensating_tx_->commit();
    compensating_tx_.reset();
    return Result<bool>(true);
}

Result<bool> CassandraAdapter::rollbackTransaction() {
    if (!compensating_tx_ || !compensating_tx_->isActive()) {
        return Error(ErrorCode::InternalError, "No transaction in progress");
    }
    auto result = compensating_tx_->rollback();
    compensating_tx_.reset();
    return result;
}

// ===== CRUD Operations (Stubs - Full Implementation Required) =====
// Note: Compensating transaction recording will be added when CRUD is implemented.
// The pattern to follow:
// - create: After successful insert, call compensating_tx_->recordCreate(entityName, id)
// - update: Before updating, snapshot via read() and call compensating_tx_->recordUpdate(entityName, id, oldData)
// - remove: Before deleting, snapshot via read() and call compensating_tx_->recordDelete(entityName, oldData)

Result<Json> CassandraAdapter::create(const std::string& entityName, const Json& data) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::create not yet implemented");
}

Result<Json> CassandraAdapter::read(const std::string& entityName, const std::string& id) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::read not yet implemented");
}

Result<Json> CassandraAdapter::update(const std::string& entityName, const std::string& id, const Json& data) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::update not yet implemented");
}

Result<bool> CassandraAdapter::remove(const std::string& entityName, const std::string& id) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::remove not yet implemented");
}

Result<ListResult<Json>> CassandraAdapter::list(const std::string& entityName, const ListOptions& options) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::list not yet implemented");
}

Result<int> CassandraAdapter::createMany(const std::string& entityName, const std::vector<Json>& records) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::createMany not yet implemented");
}

Result<int> CassandraAdapter::updateMany(const std::string& entityName, const Json& filter, const Json& data) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::updateMany not yet implemented");
}

Result<int> CassandraAdapter::deleteMany(const std::string& entityName, const Json& filter) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::deleteMany not yet implemented");
}

Result<Json> CassandraAdapter::findFirst(const std::string& entityName, const Json& filter) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::findFirst not yet implemented");
}

Result<Json> CassandraAdapter::findByField(const std::string& entityName, const std::string& field, const Json& value) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::findByField not yet implemented");
}

Result<Json> CassandraAdapter::upsert(const std::string& entityName, const std::string& uniqueField,
                                      const Json& uniqueValue, const Json& createData, const Json& updateData) {
    return Error(ErrorCode::CapabilityNotSupported, "CassandraAdapter::upsert not yet implemented");
}

// ===== Metadata =====

Result<std::vector<std::string>> CassandraAdapter::getAvailableEntities() {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size());

    for (const auto& [name, schema] : schemas_) {
        entities.push_back(name);
    }

    return entities;
}

Result<EntitySchema> CassandraAdapter::getEntitySchema(const std::string& entityName) {
    auto schema_opt = getEntitySchemaInternal(entityName);
    if (!schema_opt) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }
    return *schema_opt;
}

} // namespace cassandra
} // namespace adapters
} // namespace dbal
