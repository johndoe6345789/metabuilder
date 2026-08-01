/**
 * @file schema_acl_registry.cpp
 */
#include "schema_acl_registry.hpp"
#include <spdlog/spdlog.h>

namespace dbal::core {

SchemaAclRegistry::SchemaAclRegistry(const std::string& schemaDir) {
    EntitySchemaLoader loader;
    schemas_ = loader.loadSchemas(schemaDir);
    spdlog::info("[schema-acl] Loaded ACL metadata for {} entities from {}",
                 schemas_.size(), schemaDir);
}

const std::map<std::string, bool>* SchemaAclRegistry::operationMap(
    const EntitySchema::ACL& acl, const std::string& method) {
    if (method == "create") return &acl.create;
    if (method == "read")   return &acl.read;
    if (method == "update") return &acl.update;
    if (method == "delete") return &acl.del;
    return nullptr;
}

bool SchemaAclRegistry::isSystemOnly(const std::string& entity, const std::string& method) const {
    auto it = schemas_.find(entity);
    if (it == schemas_.end()) return false;
    if (!it->second.acl.has_value()) return false;

    const auto* opMap = operationMap(*it->second.acl, method);
    if (!opMap) return false;

    auto sysIt = opMap->find("system");
    return sysIt != opMap->end() && sysIt->second;
}

} // namespace dbal::core
