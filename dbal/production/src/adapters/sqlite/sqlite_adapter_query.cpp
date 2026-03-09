#include "sqlite_adapter.hpp"
#include "sqlite_query_builder.hpp"
#include "sqlite_type_converter.hpp"
#include "sqlite_prepared_statements.hpp"
#include "sqlite_result_parser.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

// Helper: Convert core::EntitySchema to adapters::EntitySchema
static EntitySchema convertToAdapterSchema(const core::EntitySchema& coreSchema) {
    EntitySchema adapterSchema;
    adapterSchema.name = coreSchema.name;
    adapterSchema.displayName = coreSchema.displayName;

    // Convert fields
    for (const auto& coreField : coreSchema.fields) {
        EntityField adapterField;
        adapterField.name = coreField.name;
        adapterField.type = coreField.type;
        adapterField.required = coreField.required;
        adapterField.unique = coreField.unique;
        adapterField.defaultValue = coreField.defaultValue;
        adapterField.references = coreField.references;
        adapterSchema.fields.push_back(adapterField);
    }

    // Convert indexes (core has EntityIndex[], adapter has string[])
    for (const auto& index : coreSchema.indexes) {
        if (index.name) {
            adapterSchema.indexes.push_back(*index.name);
        } else if (!index.fields.empty()) {
            // Create index name from fields
            std::string indexName = "idx_" + coreSchema.name;
            for (const auto& field : index.fields) {
                indexName += "_" + field;
            }
            adapterSchema.indexes.push_back(indexName);
        }
    }

    adapterSchema.metadata = coreSchema.metadata;

    return adapterSchema;
}

// ===== Query Operations =====

Result<Json> SQLiteAdapter::findFirst(const std::string& entityName, const Json& filter) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    const auto& schema = *schemaResult;

    const std::string sql = SQLiteQueryBuilder::buildFindFirstQuery(schema, filter);
    const auto params = SQLiteTypeConverter::buildFindParams(filter);

    auto stmtResult = prepared_stmts_->executeSelect(sql, params);
    if (!stmtResult.hasValue()) {
        return Error(stmtResult.error());
    }

    auto rowsResult = result_parser_->readAllRows(schema, stmtResult.value());
    if (!rowsResult.hasValue()) {
        return Error(rowsResult.error());
    }

    const auto& rows = rowsResult.value();
    if (rows.empty()) {
        return Error::notFound(entityName + " not found");
    }

    return Result<Json>(rows.front());
}

Result<Json> SQLiteAdapter::findByField(const std::string& entityName, const std::string& field, const Json& value) {
    Json filter;
    filter[field] = value;
    return findFirst(entityName, filter);
}

Result<Json> SQLiteAdapter::upsert(const std::string& entityName, const std::string& uniqueField,
                                   const Json& uniqueValue, const Json& createData, const Json& updateData) {
    auto existingResult = findByField(entityName, uniqueField, uniqueValue);

    if (existingResult.hasValue()) {
        const auto& existing = existingResult.value();
        std::string id = existing.at("id");
        return update(entityName, id, updateData);
    } else {
        return create(entityName, createData);
    }
}

// ===== Metadata =====

Result<std::vector<std::string>> SQLiteAdapter::getAvailableEntities() {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size());
    for (const auto& [name, _] : schemas_) {
        entities.push_back(name);
    }
    return Result<std::vector<std::string>>(entities);
}

Result<EntitySchema> SQLiteAdapter::getEntitySchema(const std::string& entityName) {
    auto schemaResult = getEntitySchemaInternal(entityName);
    if (!schemaResult) {
        return Error::validationError("Unknown entity: " + entityName);
    }
    return Result<EntitySchema>(convertToAdapterSchema(*schemaResult));
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
