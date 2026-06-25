#include "redis_adapter.hpp"

namespace dbal {
namespace adapters {
namespace redis {

Result<std::vector<std::string>> RedisAdapter::getAvailableEntities() {
    return schema_manager_.getAvailableEntities();
}

Result<EntitySchema> RedisAdapter::getEntitySchema(const std::string& entityName) {
    const auto schema_opt = schema_manager_.getSchema(entityName);
    if (!schema_opt) {
        return Error(ErrorCode::NotFound, "Entity schema not found: " + entityName);
    }

    const auto& def = *schema_opt;
    EntitySchema schema;
    schema.name = def.name;
    schema.displayName = def.description;
    for (const auto& field_def : def.fields) {
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
    return schema;
}

} // namespace redis
} // namespace adapters
} // namespace dbal
