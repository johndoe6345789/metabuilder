#include "mongodb_collection_manager.hpp"
#include <bsoncxx/builder/stream/document.hpp>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace mongodb {

MongoDBCollectionManager::MongoDBCollectionManager(mongocxx::database& database,
                                                   const std::string& schema_path)
    : database_(database) {

    loadSchemas(schema_path);
    spdlog::info("MongoDBCollectionManager: Loaded {} entity schemas", schemas_.size());
}

void MongoDBCollectionManager::loadSchemas(const std::string& schema_path) {
    auto entities = SchemaLoader::loadFromDirectory(schema_path);

    for (const auto& entity_def : entities) {
        EntitySchema schema;
        schema.name = entity_def.name;
        schema.displayName = entity_def.description;
        for (const auto& field : entity_def.fields) {
            EntityField f;
            f.name        = field.name;
            f.type        = field.type;
            f.required    = field.required;
            f.unique      = field.unique;
            f.nullable    = field.nullable || field.optional;
            f.enumValues  = field.enum_values;
            f.minLength   = field.min_length;
            f.maxLength   = field.max_length;
            f.pattern     = field.pattern;
            if (field.default_value.has_value()) {
                f.defaultValue = field.default_value.value();
            }
            schema.fields.push_back(f);
        }
        schemas_[entity_def.name] = schema;

        // Ensure unique indexes based on entity schema
        try {
            auto coll = database_[entity_def.name];
            ensureIndexes(entity_def, coll);
        } catch (const std::exception& e) {
            spdlog::warn("MongoDB: Failed to ensure indexes for {}: {}", entity_def.name, e.what());
        }
    }
}

void MongoDBCollectionManager::ensureIndexes(const EntityDefinition& entity, mongocxx::collection& coll) {
    using bsoncxx::builder::stream::document;
    using bsoncxx::builder::stream::finalize;

    // Single-field unique indexes (from field.unique in entity JSON)
    for (const auto& field : entity.fields) {
        if (field.unique && !field.primary) {
            auto keys = document{} << field.name << 1 << finalize;
            mongocxx::options::index opts{};
            opts.unique(true);
            coll.create_index(keys.view(), opts);
            spdlog::debug("MongoDB: UNIQUE index on {}.{}", entity.name, field.name);
        }
    }

    // Composite indexes from the entity's indexes[] array
    for (const auto& idx : entity.indexes) {
        if (idx.fields.size() <= 1) continue; // Single-field handled above or via field.unique
        document keys_builder{};
        for (const auto& f : idx.fields) {
            keys_builder << f << 1;
        }
        auto keys = std::move(keys_builder) << finalize;
        mongocxx::options::index opts{};
        opts.unique(idx.unique);
        coll.create_index(keys.view(), opts);
        spdlog::debug("MongoDB: {}index on {}.({}) ", idx.unique ? "UNIQUE " : "",
                      entity.name,
                      [&]{ std::string s; for (size_t i = 0; i < idx.fields.size(); ++i) {
                               if (i) s += ", "; s += idx.fields[i]; } return s; }());
    }
}

mongocxx::collection MongoDBCollectionManager::getCollection(const std::string& entityName) {
    return database_[entityName];
}

std::vector<std::string> MongoDBCollectionManager::getAvailableEntities() const {
    std::vector<std::string> entities;
    entities.reserve(schemas_.size());

    for (const auto& [name, schema] : schemas_) {
        entities.push_back(name);
    }

    return entities;
}

std::optional<EntitySchema> MongoDBCollectionManager::getEntitySchema(const std::string& entityName) const {
    auto it = schemas_.find(entityName);
    if (it == schemas_.end()) {
        return std::nullopt;
    }
    return it->second;
}

size_t MongoDBCollectionManager::getSchemaCount() const {
    return schemas_.size();
}

} // namespace mongodb
} // namespace adapters
} // namespace dbal
