/**
 * @file schema_acl_registry.hpp
 * @brief Loads every entity schema once and answers "is this entity/method
 *        system-only?" (schema.acl.<op>.system == true).
 *
 * Fixes a real pre-existing gap: EntitySchemaLoader::parseACL already parses
 * schema.acl into EntitySchema::ACL, but nothing in the route layer ever
 * reads it — any entity, including internal-only ones, was reachable through
 * the generic /{tenant}/{package}/{entity} routes. This registry is what
 * server_routes.cpp calls to close that gap.
 */
#pragma once

#include "dbal/core/entity_loader.hpp"
#include <map>
#include <string>

namespace dbal::core {

/**
 * @brief Read-only, load-once-at-startup registry of per-entity ACL flags.
 */
class SchemaAclRegistry {
public:
    /// Loads every *.json schema under @p schemaDir via EntitySchemaLoader.
    explicit SchemaAclRegistry(const std::string& schemaDir);

    /**
     * @brief True if @p entity's ACL marks @p method as system-only.
     * @param method One of "create", "read", "update", "delete".
     *
     * Unknown entities and entities with no acl.<method> block at all are
     * NOT system-only by default (fail open to existing behavior) — this
     * registry only tightens entities that explicitly opt in via schema.acl,
     * matching how Credential.json/Session.json already declare it.
     */
    bool isSystemOnly(const std::string& entity, const std::string& method) const;

private:
    std::map<std::string, EntitySchema> schemas_;

    static const std::map<std::string, bool>* operationMap(
        const EntitySchema::ACL& acl, const std::string& method);
};

} // namespace dbal::core
