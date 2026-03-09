#include "dbal/core/loaders/field_parser.hpp"
#include "dbal/core/entity_loader.hpp"

namespace dbal {
namespace core {
namespace loaders {

EntityField FieldParser::parseField(const std::string& fieldName, const nlohmann::json& fieldNode) {
    EntityField field;
    field.name = fieldName;
    field.type = parseType(fieldNode);
    parseFlags(fieldNode, field);
    parseOptionalProperties(fieldNode, field);
    parseValidation(fieldNode, field);
    if (field.type == "enum" && fieldNode.contains("values")) {
        field.enumValues = parseEnumValues(fieldNode);
    }
    return field;
}

std::string FieldParser::parseType(const nlohmann::json& fieldNode) {
    return fieldNode.value("type", std::string("string"));
}

void FieldParser::parseFlags(const nlohmann::json& fieldNode, EntityField& field) {
    field.required  = fieldNode.value("required",  false);
    field.unique    = fieldNode.value("unique",     false);
    field.primary   = fieldNode.value("primary",   false);
    field.generated = fieldNode.value("generated", false);
    field.nullable  = fieldNode.value("nullable",  false);
    field.index     = fieldNode.value("index",     false);
}

void FieldParser::parseOptionalProperties(const nlohmann::json& fieldNode, EntityField& field) {
    if (fieldNode.contains("default")) {
        auto& def = fieldNode["default"];
        if (def.is_string()) field.defaultValue = def.get<std::string>();
        else if (!def.is_null()) field.defaultValue = def.dump();
    }
    if (fieldNode.contains("references"))
        field.references = fieldNode["references"].get<std::string>();
    if (fieldNode.contains("description"))
        field.description = fieldNode["description"].get<std::string>();
}

void FieldParser::parseValidation(const nlohmann::json& fieldNode, EntityField& field) {
    if (fieldNode.contains("min_length"))
        field.minLength = fieldNode["min_length"].get<int>();
    else if (fieldNode.contains("minLength"))
        field.minLength = fieldNode["minLength"].get<int>();

    if (fieldNode.contains("max_length"))
        field.maxLength = fieldNode["max_length"].get<int>();
    else if (fieldNode.contains("maxLength"))
        field.maxLength = fieldNode["maxLength"].get<int>();

    if (fieldNode.contains("pattern"))
        field.pattern = fieldNode["pattern"].get<std::string>();
}

std::vector<std::string> FieldParser::parseEnumValues(const nlohmann::json& fieldNode) {
    std::vector<std::string> enumValues;
    for (const auto& value : fieldNode["values"]) {
        enumValues.push_back(value.get<std::string>());
    }
    return enumValues;
}

}  // namespace loaders
}  // namespace core
}  // namespace dbal
