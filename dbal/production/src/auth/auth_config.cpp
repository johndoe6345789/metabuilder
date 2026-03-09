/**
 * @file auth_config.cpp
 * @brief JSON auth config loader implementation
 */

#include "auth_config.hpp"
#include <nlohmann/json.hpp>
#include <fstream>
#include <spdlog/spdlog.h>

namespace dbal::auth {

EntityAuthConfig AuthConfig::getEntityConfig(
    const std::string& tenant, const std::string& entity) const
{
    auto t_it = tenants.find(tenant);
    if (t_it == tenants.end()) {
        EntityAuthConfig cfg;
        cfg.require_auth = require_auth;
        return cfg;
    }
    const auto& t_cfg = t_it->second;
    auto e_it = t_cfg.entities.find(entity);
    if (e_it == t_cfg.entities.end()) {
        EntityAuthConfig cfg;
        cfg.require_auth = t_cfg.require_auth;
        return cfg;
    }
    return e_it->second;
}

static EntityAuthConfig parseEntityNode(const nlohmann::json& node) {
    EntityAuthConfig cfg;
    cfg.require_auth    = node.value("require_auth",    false);
    cfg.inject_owner    = node.value("inject_owner",    false);
    cfg.filter_by_owner = node.value("filter_by_owner", false);
    cfg.check_ownership = node.value("check_ownership", false);
    return cfg;
}

AuthConfig AuthConfig::load(const std::string& json_path) {
    AuthConfig config;
    try {
        std::ifstream f(json_path);
        if (!f.is_open()) throw std::runtime_error("Cannot open file");
        nlohmann::json root = nlohmann::json::parse(f);

        if (root.contains("defaults")) {
            const auto& d = root["defaults"];
            config.require_auth = d.value("require_auth", false);
            config.cors_origin  = d.value("cors_origin",  std::string(""));
        }

        if (root.contains("tenants")) {
            for (auto& [tenant_name, t_node] : root["tenants"].items()) {
                TenantAuthConfig t_cfg;
                t_cfg.require_auth = t_node.value("require_auth", config.require_auth);
                t_cfg.cors_origin  = t_node.value("cors_origin",  config.cors_origin);

                if (t_node.contains("entities")) {
                    for (auto& [entity_name, e_node] : t_node["entities"].items()) {
                        t_cfg.entities[entity_name] = parseEntityNode(e_node);
                    }
                }
                config.tenants[tenant_name] = std::move(t_cfg);
            }
        }
        spdlog::info("[auth] Loaded auth config from {}: {} tenant(s)",
                     json_path, config.tenants.size());
    } catch (const std::exception& e) {
        spdlog::warn("[auth] Failed to load auth config '{}': {} — using all-false defaults",
                     json_path, e.what());
    }
    return config;
}

AuthConfig AuthConfig::loadDefault() {
    spdlog::debug("[auth] No DBAL_AUTH_CONFIG set — auth enforcement disabled");
    return AuthConfig{};
}

} // namespace dbal::auth
