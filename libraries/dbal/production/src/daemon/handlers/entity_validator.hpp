/**
 * @file entity_validator.hpp
 * @brief JSON-schema-driven validation for entity create/update payloads.
 *
 * Constraints are read directly from EntityField — populated by loadSchemas()
 * from the entity JSON definitions (required, enum_values, min_length,
 * max_length, pattern).  No hard-coded rules.
 */
#pragma once

#include <regex>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/adapters/adapter.hpp"

namespace dbal {
namespace daemon {
namespace handlers {

struct ValidationError {
    std::string field;
    std::string message;
};

/**
 * Validate entity data against field constraints.
 *
 * @param schema    Entity schema (from getEntitySchema).
 * @param data      Payload being written (nlohmann::json object).
 * @param isCreate  true for POST (required fields enforced); false for PATCH/PUT.
 * @return Vector of errors, empty when valid.
 */
inline std::vector<ValidationError> validateEntityData(
    const adapters::EntitySchema& schema,
    const nlohmann::json& data,
    bool isCreate)
{
    std::vector<ValidationError> errors;

    for (const auto& field : schema.fields) {
        // Primary key is server-generated; skip validation
        if (field.name == "id") continue;
        // DB-generated timestamp; skip validation
        if (field.name == "createdAt") continue;

        bool present = data.contains(field.name) && !data[field.name].is_null();

        // Required field check (CREATE only — PATCH may omit fields)
        if (isCreate && field.required && !present) {
            errors.push_back({field.name, "Field is required"});
            continue;
        }

        if (!present) continue; // Optional / not supplied on update

        // Type checks for string fields
        if (field.type == "string" || field.type == "email" || field.type == "text" ||
            field.type == "uuid" || field.type == "cuid" || field.type == "enum") {
            if (!data[field.name].is_string()) {
                errors.push_back({field.name, "Expected string value"});
                continue;
            }
            const auto& val = data[field.name].get_ref<const std::string&>();

            if (field.minLength.has_value() && static_cast<int>(val.size()) < *field.minLength) {
                errors.push_back({field.name,
                    "Minimum length is " + std::to_string(*field.minLength)});
            }
            if (field.maxLength.has_value() && static_cast<int>(val.size()) > *field.maxLength) {
                errors.push_back({field.name,
                    "Maximum length is " + std::to_string(*field.maxLength)});
            }
            if (field.enumValues.has_value()) {
                const auto& allowed = *field.enumValues;
                if (std::find(allowed.begin(), allowed.end(), val) == allowed.end()) {
                    errors.push_back({field.name, "Invalid enum value"});
                }
            }
            // Pattern constraint
            if (field.pattern && !field.pattern->empty()) {
                try {
                    std::regex re(*field.pattern);
                    if (!std::regex_search(val, re))
                        errors.push_back({field.name, "Does not match required pattern"});
                } catch (...) {}   // Silently ignore bad regex in schema
            }
        }

        // Type checks for numeric fields
        if (field.type == "number" || field.type == "bigint" ||
            field.type == "integer" || field.type == "int") {
            if (!data[field.name].is_number()) {
                errors.push_back({field.name, "Expected a numeric value"});
            }
        }

        // Type checks for boolean fields
        if (field.type == "boolean") {
            if (!data[field.name].is_boolean() && !data[field.name].is_number() &&
                !data[field.name].is_string()) {
                errors.push_back({field.name, "Expected a boolean value"});
            }
        }
    }

    return errors;
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
