#ifndef DBAL_ADAPTER_HPP
#define DBAL_ADAPTER_HPP

#include <string>
#include <vector>
#include <map>
#include <nlohmann/json.hpp>
#include "../types.hpp"
#include "../errors.hpp"

namespace dbal::adapters {

using Json = nlohmann::json;

// Generic list result wrapper
template<typename T>
struct ListResult {
    std::vector<T> items{};
    int total{0};
    int page{0};
    int limit{0};
};

// Entity field metadata
struct EntityField {
    std::string name{};
    std::string type{};         // "string", "number", "boolean", "timestamp", "json"
    bool required{false};
    bool unique{false};
    bool nullable{false};
    std::optional<std::string> defaultValue{};
    std::optional<std::string> references{};  // FK to other entity
    // Constraint validation (from JSON schema)
    std::optional<int> minLength{};
    std::optional<int> maxLength{};
    std::optional<std::string> pattern{};
    std::optional<std::vector<std::string>> enumValues{};
};

// Relation metadata (from entity JSON "relations" section)
struct RelationDef {
    std::string name;                // e.g. "namespace"
    std::string type;                // "has-many" | "belongs-to"
    std::string target_entity;       // e.g. "Namespace"
    std::string foreign_key;         // field on this or target entity
    bool cascade_delete = false;
};

// Per-entity BI query configuration (from entity JSON "query" section)
struct QueryConfig {
    std::vector<std::string> allowed_operators;   // e.g. ["eq","gt","like","in"]
    std::vector<std::string> allowed_group_by;    // allowed GROUP BY fields
    std::vector<std::string> allowed_includes;    // allowed relation includes
    int max_results = 1000;
    int timeout_ms = 0;                           // 0 = global default
};

// Entity schema metadata
struct EntitySchema {
    std::string name{};
    std::string displayName{};
    std::vector<EntityField> fields{};
    std::vector<std::string> indexes{};
    std::map<std::string, std::string> metadata{};
    std::vector<RelationDef> relations{};         // parsed from "relations" section
    QueryConfig query_config{};                   // parsed from "query" section
};

/**
 * Generic DBAL Adapter Interface
 *
 * Entities are NOT hardcoded - they are loaded dynamically from YAML schemas
 * All operations use entity name + JSON data instead of typed structs
 *
 * This matches the TypeScript DBAL pattern (see /dbal/development/src/core/client/)
 */
class Adapter {
public:
    virtual ~Adapter() = default;

    // ===== Generic CRUD Operations =====
    // Works for ANY entity loaded from YAML schemas

    virtual Result<Json> create(const std::string& entityName, const Json& data) = 0;
    virtual Result<Json> read(const std::string& entityName, const std::string& id) = 0;
    virtual Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) = 0;
    virtual Result<bool> remove(const std::string& entityName, const std::string& id) = 0;
    virtual Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) = 0;

    // ===== Bulk Operations =====

    virtual Result<int> createMany(const std::string& entityName, const std::vector<Json>& records) = 0;
    virtual Result<int> updateMany(const std::string& entityName, const Json& filter, const Json& data) = 0;
    virtual Result<int> deleteMany(const std::string& entityName, const Json& filter) = 0;

    // ===== Query Operations =====

    virtual Result<Json> findFirst(const std::string& entityName, const Json& filter) = 0;
    virtual Result<Json> findByField(const std::string& entityName, const std::string& field, const Json& value) = 0;
    virtual Result<Json> upsert(const std::string& entityName, const std::string& uniqueField, const Json& uniqueValue, const Json& createData, const Json& updateData) = 0;

    // ===== Metadata =====

    virtual Result<std::vector<std::string>> getAvailableEntities() = 0;
    virtual Result<EntitySchema> getEntitySchema(const std::string& entityName) = 0;

    virtual void close() = 0;

    // ===== Transaction Operations =====

    virtual bool supportsNativeTransactions() const { return false; }
    virtual Result<bool> beginTransaction() { return Error::internal("Transactions not supported by this adapter"); }
    virtual Result<bool> commitTransaction() { return Error::internal("Transactions not supported by this adapter"); }
    virtual Result<bool> rollbackTransaction() { return Error::internal("Transactions not supported by this adapter"); }
};

} // namespace dbal::adapters

#endif
