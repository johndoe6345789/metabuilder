#pragma once

#include <map>
#include <string>
#include <vector>
#include <optional>
#include <nlohmann/json.hpp>
#include "relation_def.hpp"

namespace dbal {
namespace core {

struct EntityField {
    std::string name;
    std::string type;         // "string", "number", "boolean", "timestamp", "json", "uuid", "email", "text", "bigint", "enum", "cuid"
    bool required = false;
    bool unique = false;
    bool primary = false;
    bool generated = false;
    bool nullable = false;
    bool index = false;
    std::optional<std::string> defaultValue;
    std::optional<std::string> references;
    std::optional<int> minLength;
    std::optional<int> maxLength;
    std::optional<std::string> pattern;
    std::optional<std::vector<std::string>> enumValues;
    std::optional<std::string> description;
};

struct EntityIndex {
    std::vector<std::string> fields;
    bool unique = false;
    std::optional<std::string> name;
};

struct EntitySchema {
    std::string name;
    std::string displayName;
    std::string description;
    std::string version;
    std::vector<EntityField> fields;
    std::vector<EntityIndex> indexes;
    std::vector<RelationDef> relations;
    std::map<std::string, std::string> metadata;

    struct ACL {
        std::map<std::string, bool> create;
        std::map<std::string, bool> read;
        std::map<std::string, bool> update;
        std::map<std::string, bool> del;
    };
    std::optional<ACL> acl;
};

/**
 * @brief Loads entity schemas from JSON files
 */
class EntitySchemaLoader {
public:
    std::map<std::string, EntitySchema> loadSchemas(const std::string& schemaPath);
    EntitySchema loadSchema(const std::string& filePath);
    static std::string getDefaultSchemaPath();

private:
    std::vector<std::string> findJsonFiles(const std::string& dir);
    EntitySchema parseJson(const nlohmann::json& node);
    EntityField parseField(const std::string& fieldName, const nlohmann::json& fieldNode);
    EntityIndex parseIndex(const nlohmann::json& indexNode);
    EntitySchema::ACL parseACL(const nlohmann::json& aclNode);
};

}  // namespace core
}  // namespace dbal
