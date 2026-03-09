#pragma once

#include <string>
#include <vector>
#include <optional>
#include <nlohmann/json.hpp>

namespace dbal {
namespace core {

struct EntityField;

namespace loaders {

class FieldParser {
public:
    EntityField parseField(const std::string& fieldName, const nlohmann::json& fieldNode);

private:
    std::string parseType(const nlohmann::json& fieldNode);
    void parseFlags(const nlohmann::json& fieldNode, EntityField& field);
    void parseOptionalProperties(const nlohmann::json& fieldNode, EntityField& field);
    void parseValidation(const nlohmann::json& fieldNode, EntityField& field);
    std::vector<std::string> parseEnumValues(const nlohmann::json& fieldNode);
};

}  // namespace loaders
}  // namespace core
}  // namespace dbal
