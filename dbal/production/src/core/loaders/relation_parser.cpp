#include "dbal/core/loaders/relation_parser.hpp"
#include "dbal/core/entity_loader.hpp"

namespace dbal {
namespace core {
namespace loaders {

EntityIndex RelationParser::parseIndex(const nlohmann::json& indexNode) {
    EntityIndex index;
    index.fields = parseIndexFields(indexNode);
    index.unique = indexNode.value("unique", false);
    if (indexNode.contains("name"))
        index.name = indexNode["name"].get<std::string>();
    return index;
}

EntitySchema::ACL RelationParser::parseACL(const nlohmann::json& aclNode) {
    EntitySchema::ACL acl;
    if (aclNode.contains("create")) acl.create = parseACLOperation(aclNode["create"]);
    if (aclNode.contains("read"))   acl.read   = parseACLOperation(aclNode["read"]);
    if (aclNode.contains("update")) acl.update = parseACLOperation(aclNode["update"]);
    if (aclNode.contains("delete")) acl.del    = parseACLOperation(aclNode["delete"]);
    return acl;
}

std::vector<std::string> RelationParser::parseIndexFields(const nlohmann::json& indexNode) {
    std::vector<std::string> fields;
    if (indexNode.contains("fields")) {
        for (const auto& f : indexNode["fields"])
            fields.push_back(f.get<std::string>());
    }
    return fields;
}

std::map<std::string, bool> RelationParser::parseACLOperation(const nlohmann::json& operationNode) {
    std::map<std::string, bool> permissions;
    for (auto& [k, v] : operationNode.items())
        permissions[k] = v.get<bool>();
    return permissions;
}

}  // namespace loaders
}  // namespace core
}  // namespace dbal
