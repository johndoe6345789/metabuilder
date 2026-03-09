#include "dbal/core/entity_loader.hpp"
#include "dbal/core/loaders/json_parser.hpp"
#include "dbal/core/loaders/field_parser.hpp"
#include "dbal/core/loaders/relation_parser.hpp"
#include "dbal/core/loaders/schema_validator.hpp"
#include "dbal/core/loaders/schema_cache.hpp"
#include <filesystem>
#include <spdlog/spdlog.h>

namespace fs = std::filesystem;

namespace dbal {
namespace core {

static loaders::SchemaCache schemaCache;

std::string EntitySchemaLoader::getDefaultSchemaPath() {
    std::vector<std::string> possibilities = {
        "dbal/shared/api/schema/entities",
        "../dbal/shared/api/schema/entities",
        "../../dbal/shared/api/schema/entities",
        "../../../dbal/shared/api/schema/entities"
    };
    for (const auto& path : possibilities) {
        if (fs::exists(path) && fs::is_directory(path)) return path;
    }
    throw std::runtime_error("Could not find DBAL schema directory. Tried paths: " +
                             possibilities[0] + ", " + possibilities[1] + ", etc.");
}

std::map<std::string, EntitySchema> EntitySchemaLoader::loadSchemas(const std::string& schemaPath) {
    std::map<std::string, EntitySchema> schemas;
    if (!fs::exists(schemaPath) || !fs::is_directory(schemaPath)) {
        spdlog::error("Schema path does not exist or is not a directory: {}", schemaPath);
        return schemas;
    }

    loaders::JsonParser jsonParser;
    auto jsonFiles = jsonParser.findJsonFiles(schemaPath);
    spdlog::info("Found {} JSON schema files in {}", jsonFiles.size(), schemaPath);

    for (const auto& file : jsonFiles) {
        try {
            loaders::JsonParser jp;
            nlohmann::json root = jp.loadFile(file);
            // A file may hold a single entity object or an array of entities
            nlohmann::json docs = root.is_array() ? root : nlohmann::json::array({root});
            for (const auto& node : docs) {
                if (!node.is_object()) continue;
                EntitySchema schema = parseJson(node);
                if (schema.name.empty()) { spdlog::warn("Schema has no name in {}", file); continue; }

                loaders::SchemaValidator validator;
                auto vr = validator.validate(schema);
                if (!vr.isValid()) {
                    for (const auto& e : vr.errors) spdlog::error("Schema {} error: {}", file, e);
                    continue;
                }
                for (const auto& w : vr.warnings) spdlog::warn("Schema {}: {}", file, w);

                schemas[schema.name] = schema;
                schemaCache.put(schema.name, schema);
                spdlog::debug("Loaded entity schema: {} ({})", schema.name, schema.displayName);
            }
        } catch (const std::exception& e) {
            spdlog::error("Failed to load schema from {}: {}", file, e.what());
        }
    }

    spdlog::info("Successfully loaded {} entity schemas", schemas.size());
    return schemas;
}

EntitySchema EntitySchemaLoader::loadSchema(const std::string& filePath) {
    if (!fs::exists(filePath)) {
        throw std::runtime_error("Schema file does not exist: " + filePath);
    }

    loaders::JsonParser jsonParser;
    nlohmann::json root = jsonParser.loadFile(filePath);
    // Use first element if file contains an array of entities
    nlohmann::json node = (root.is_array() && !root.empty()) ? root[0] : root;
    EntitySchema schema = parseJson(node);

    loaders::SchemaValidator validator;
    auto validationResult = validator.validate(schema);
    if (!validationResult.isValid()) {
        std::string errorMsg = "Schema validation failed for " + filePath + ":\n";
        for (const auto& error : validationResult.errors)
            errorMsg += "  ERROR: " + error + "\n";
        throw std::runtime_error(errorMsg);
    }
    for (const auto& warning : validationResult.warnings)
        spdlog::warn("Schema {}: {}", filePath, warning);

    return schema;
}

std::vector<std::string> EntitySchemaLoader::findJsonFiles(const std::string& dir) {
    loaders::JsonParser jsonParser;
    return jsonParser.findJsonFiles(dir);
}

EntitySchema EntitySchemaLoader::parseJson(const nlohmann::json& node) {
    EntitySchema schema;

    if (node.contains("entity"))
        schema.name = node.value("entity", std::string(""));
    else if (node.contains("name"))
        schema.name = node.value("name", std::string(""));

    schema.displayName  = node.value("displayName",  schema.name);
    schema.description  = node.value("description",  std::string(""));
    schema.version      = node.value("version",      std::string("1.0"));

    loaders::FieldParser fieldParser;
    if (node.contains("fields")) {
        for (auto& [fieldName, fieldNode] : node["fields"].items()) {
            schema.fields.push_back(fieldParser.parseField(fieldName, fieldNode));
        }
    }

    loaders::RelationParser relationParser;
    if (node.contains("indexes")) {
        for (const auto& indexNode : node["indexes"])
            schema.indexes.push_back(relationParser.parseIndex(indexNode));
    }

    if (node.contains("acl"))
        schema.acl = relationParser.parseACL(node["acl"]);

    if (node.contains("metadata")) {
        for (auto& [k, v] : node["metadata"].items())
            schema.metadata[k] = v.is_string() ? v.get<std::string>() : v.dump();
    }

    return schema;
}

EntityField EntitySchemaLoader::parseField(const std::string& fieldName, const nlohmann::json& fieldNode) {
    loaders::FieldParser fieldParser;
    return fieldParser.parseField(fieldName, fieldNode);
}

EntityIndex EntitySchemaLoader::parseIndex(const nlohmann::json& indexNode) {
    loaders::RelationParser relationParser;
    return relationParser.parseIndex(indexNode);
}

EntitySchema::ACL EntitySchemaLoader::parseACL(const nlohmann::json& aclNode) {
    loaders::RelationParser relationParser;
    return relationParser.parseACL(aclNode);
}

}  // namespace core
}  // namespace dbal
