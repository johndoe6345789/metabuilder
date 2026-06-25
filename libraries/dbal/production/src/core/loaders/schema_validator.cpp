#include "dbal/core/loaders/schema_validator.hpp"
#include "dbal/core/entity_loader.hpp"
#include <spdlog/spdlog.h>
#include <algorithm>

namespace dbal {
namespace core {
namespace loaders {

ValidationResult SchemaValidator::validate(const EntitySchema& schema) {
    ValidationResult result;

    validateMetadata(schema, result);
    validateFields(schema, result);
    validateIndexes(schema, result);

    return result;
}

void SchemaValidator::validateMetadata(const EntitySchema& schema, ValidationResult& result) {
    if (schema.name.empty()) {
        result.addError("Entity schema must have a 'name' or 'entity' field");
    }

    if (schema.fields.empty()) {
        result.addError("Entity schema '" + schema.name + "' has no fields defined");
    }

    if (schema.version.empty()) {
        result.addWarning("Entity schema '" + schema.name + "' has no version specified");
    }
}

void SchemaValidator::validateFields(const EntitySchema& schema, ValidationResult& result) {
    bool hasPrimary = false;

    for (const auto& field : schema.fields) {
        validateField(field, result);

        if (field.primary) {
            if (hasPrimary) {
                result.addError("Entity '" + schema.name + "' has multiple primary key fields");
            }
            hasPrimary = true;
        }
    }

    if (!hasPrimary) {
        result.addWarning("Entity '" + schema.name + "' has no primary key field defined");
    }
}

void SchemaValidator::validateField(const EntityField& field, ValidationResult& result) {
    if (field.name.empty()) {
        result.addError("Field has no name");
        return;
    }

    if (!isValidFieldType(field.type)) {
        result.addError("Field '" + field.name + "' has invalid type: " + field.type);
    }

    // Validate enum fields have values
    if (field.type == "enum" && (!field.enumValues || field.enumValues->empty())) {
        result.addError("Enum field '" + field.name + "' has no values defined");
    }

    // Validate references
    if (field.references && field.references->empty()) {
        result.addWarning("Field '" + field.name + "' has empty references");
    }

    // Validate length constraints
    if (field.minLength && field.maxLength) {
        if (*field.minLength > *field.maxLength) {
            result.addError("Field '" + field.name + "' has minLength > maxLength");
        }
    }
}

void SchemaValidator::validateIndexes(const EntitySchema& schema, ValidationResult& result) {
    for (const auto& index : schema.indexes) {
        if (index.fields.empty()) {
            result.addError("Index in entity '" + schema.name + "' has no fields");
            continue;
        }

        // Validate that indexed fields exist
        for (const auto& indexField : index.fields) {
            bool fieldExists = false;
            for (const auto& schemaField : schema.fields) {
                if (schemaField.name == indexField) {
                    fieldExists = true;
                    break;
                }
            }

            if (!fieldExists) {
                result.addError("Index references non-existent field '" + indexField +
                              "' in entity '" + schema.name + "'");
            }
        }
    }
}

bool SchemaValidator::isValidFieldType(const std::string& type) {
    auto validTypes = getValidFieldTypes();
    return std::find(validTypes.begin(), validTypes.end(), type) != validTypes.end();
}

std::vector<std::string> SchemaValidator::getValidFieldTypes() {
    return {
        "string", "number", "boolean", "timestamp", "json",
        "uuid", "email", "text", "bigint", "enum", "cuid",
        "integer", "float", "double", "date", "datetime"
    };
}

}  // namespace loaders
}  // namespace core
}  // namespace dbal
