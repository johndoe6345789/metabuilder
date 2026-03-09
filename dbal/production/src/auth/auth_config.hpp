/**
 * @file auth_config.hpp
 * @brief Per-tenant, per-entity authentication and ownership config loaded from YAML.
 *
 * Loaded at startup from the file specified by DBAL_AUTH_CONFIG env var.
 * If the file is missing, all-false defaults are used (backward compatible).
 */
#pragma once

#include <map>
#include <string>

namespace dbal::auth {

/**
 * @brief Auth rules for a single entity within a tenant.
 */
struct EntityAuthConfig {
    bool require_auth    = false; ///< JWT required to access this entity
    bool inject_owner    = false; ///< POST: auto-set userId+tenantId from JWT claims
    bool filter_by_owner = false; ///< GET list: append userId filter automatically
    bool check_ownership = false; ///< GET/PUT/DELETE by id: verify entity.userId == jwt.sub
};

/**
 * @brief Auth rules for a tenant, with per-entity overrides.
 */
struct TenantAuthConfig {
    bool require_auth = false;
    std::string cors_origin;
    std::map<std::string, EntityAuthConfig> entities; ///< keyed by entity name (e.g. "Snippet")
};

/**
 * @brief Top-level auth config with global defaults + per-tenant overrides.
 */
struct AuthConfig {
    bool require_auth = false;
    std::string cors_origin = "http://localhost:3000";
    std::map<std::string, TenantAuthConfig> tenants;

    /**
     * @brief Resolve effective EntityAuthConfig for a given tenant+entity.
     *
     * Priority: entity config > tenant config > global default.
     * If the entity is not listed, the tenant's require_auth flag is inherited.
     */
    EntityAuthConfig getEntityConfig(const std::string& tenant,
                                     const std::string& entity) const;

    /** @brief Load config from a YAML file. Falls back to defaults on error. */
    static AuthConfig load(const std::string& yaml_path);

    /** @brief Return all-false defaults (no auth enforcement). */
    static AuthConfig loadDefault();
};

} // namespace dbal::auth
