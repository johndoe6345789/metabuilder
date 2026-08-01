/**
 * @file sp_registry.cpp
 */
#include "sp_registry.hpp"

#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>
#include <fstream>
#include <stdexcept>

namespace dbal::saml::metadata {

SpRegistry SpRegistry::load(const std::string& path) {
    std::ifstream f(path);
    if (!f.is_open()) {
        throw std::runtime_error("Cannot open SAML SP registry: " + path);
    }
    nlohmann::json root = nlohmann::json::parse(f); // throws on malformed JSON — fail loudly

    if (!root.contains("service_providers") || !root["service_providers"].is_array()) {
        throw std::runtime_error("SAML SP registry missing 'service_providers' array: " + path);
    }

    SpRegistry registry;
    for (const auto& node : root["service_providers"]) {
        ServiceProvider sp;
        sp.entity_id = node.at("entity_id").get<std::string>();
        sp.name = node.value("name", sp.entity_id);
        sp.acs_url = node.at("acs_url").get<std::string>();

        if (sp.acs_url.empty()) {
            throw std::runtime_error("SP '" + sp.entity_id + "': acs_url must not be empty");
        }

        registry.sps_[sp.entity_id] = std::move(sp);
    }

    spdlog::info("[saml] Loaded {} service provider(s) from {}", registry.sps_.size(), path);
    return registry;
}

std::optional<ServiceProvider> SpRegistry::get(const std::string& entityId) const {
    auto it = sps_.find(entityId);
    if (it == sps_.end()) return std::nullopt;
    return it->second;
}

} // namespace dbal::saml::metadata
